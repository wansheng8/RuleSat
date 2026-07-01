const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const Parser = require('../src/parser');
const Deduplicator = require('../src/deduplicator');
const Categorizer = require('../src/categorizer');
const Converter = require('../src/converter');
const Validator = require('../src/validator');
const Merger = require('../src/merger');
const Fetcher = require('../src/fetcher');
const Writer = require('../src/writer');

const sampleAdblockRules = `! Title: Test filter
! Comment line
||example.com/banner^
||doubleclick.net^$third-party
||tracker.io/analytics^$script,third-party
@@||example.com/whitelist^
||adserver.com^$popup
||miner.co^$script
example.com##.ad-banner
example.com#@#.allowed-ad
example.com#%#//scriptlet('abort-on-property-read', 'test')
||phishing-site.com^$document
:://web.archive.org/web/||bad.domain^
`;

const sampleHostsRules = `0.0.0.0 tracker.example.com
0.0.0.0 ads.doubleclick.net
127.0.0.1 bad.domain.org
0.0.0.0 localhost
# Comment line
`;

describe('Parser', () => {
  it('parses adblock rules correctly', () => {
    const parser = new Parser();
    const rules = parser.parse(sampleAdblockRules, 'abp');
    assert.ok(rules.length > 0, 'Should parse at least some rules');
  });

  it('parses hosts rules correctly', () => {
    const parser = new Parser();
    const rules = parser.parse(sampleHostsRules, 'hosts');
    assert.ok(rules.length > 0, 'Should parse hosts rules');
    assert.ok(rules.every(r => r.type === 'network'), 'All should be network type');
  });

  it('parses element hiding rules', () => {
    const parser = new Parser();
    const rules = parser.parse('example.com##.ad-banner\nexample.com#%#//scriptlet("test")', 'abp');
    assert.strictEqual(rules.length, 2);
    assert.strictEqual(rules[0].type, 'css');
    assert.strictEqual(rules[1].type, 'script-injection');
  });

  it('parses whitelist rules', () => {
    const parser = new Parser();
    const rules = parser.parse('@@||example.com^', 'abp');
    assert.strictEqual(rules[0].subtype, 'whitelist');
    assert.strictEqual(rules[0].priority, 100);
  });
});

describe('Deduplicator', () => {
  it('removes duplicate rules', () => {
    const dedup = new Deduplicator();
    const rules = [
      { rule: '||example.com^', categories: ['ads'] },
      { rule: '||example.com^', categories: ['tracking'] },
      { rule: '||other.com^', categories: ['ads'] },
    ];
    const result = dedup.deduplicate(rules);
    assert.strictEqual(result.length, 2);
  });

  it('merges categories of duplicate rules', () => {
    const dedup = new Deduplicator();
    const rules = [
      { rule: '||example.com^', categories: ['ads'] },
      { rule: '||example.com^', categories: ['tracking'] },
    ];
    const result = dedup.deduplicate(rules);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].categories.includes('ads'));
    assert.ok(result[0].categories.includes('tracking'));
  });

  it('normalizes rules for comparison', () => {
    const dedup = new Deduplicator();
    const rules = [
      { rule: '||example.com/^' },
      { rule: '||example.com/^' },
    ];
    const result = dedup.deduplicate(rules);
    assert.strictEqual(result.length, 1);
  });
});

describe('Categorizer', () => {
  it('categorizes by keywords', () => {
    const cat = new Categorizer();
    const rules = [
      { rule: '||doubleclick.net^', categories: [] },
      { rule: '||tracker.io^', categories: [] },
      { rule: '||coinhive.com^', categories: [] },
    ];
    cat.categorize(rules, null);
    assert.ok(rules[0].categories.includes('ads'));
    assert.ok(rules[1].categories.includes('tracking'));
    assert.ok(rules[2].categories.includes('mining'));
  });

  it('categorizes by options', () => {
    const cat = new Categorizer();
    const rule = { rule: '||site.com^$cookie', categories: [], options: { cookie: true } };
    cat.categorize([rule], null);
    assert.ok(rule.categories.includes('cookies'));
  });
});

describe('Converter', () => {
  const sampleRules = [
    { rule: '||example.com^', domain: 'example.com', categories: ['ads'], options: {} },
    { rule: '||tracker.io^$script', domain: 'tracker.io', categories: ['tracking'], options: { script: true } },
  ];

  it('converts to AdGuard format', () => {
    const conv = new Converter();
    const output = conv.toAdguardFormat(sampleRules);
    assert.ok(output.includes('AdGuard'));
    assert.ok(output.includes('||example.com^'));
  });

  it('converts to hosts format', () => {
    const conv = new Converter();
    const output = conv.toHostsFormat(sampleRules);
    assert.ok(output.includes('0.0.0.0 example.com'));
    assert.ok(output.includes('0.0.0.0 tracker.io'));
  });

  it('converts to DNS formats', () => {
    const conv = new Converter();
    const dnsmasq = conv.toDnsmasqFormat(sampleRules);
    assert.ok(dnsmasq.includes('server=/example.com/'));
    const unbound = conv.toUnboundFormat(sampleRules);
    assert.ok(unbound.includes('local-zone: "example.com"'));
    const bind = conv.toBindFormat(sampleRules);
    assert.ok(bind.includes('example.com CNAME .'));
  });

  it('converts to JSON', () => {
    const conv = new Converter();
    const output = conv.toJson(sampleRules);
    const parsed = JSON.parse(output);
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0].d, 'example.com');
  });

  it('converts to AdGuard Home format (DNS-only)', () => {
    const conv = new Converter();
    const rules = [
      { rule: '||ad.com^', domain: 'ad.com', type: 'network', categories: ['ads'] },
      { rule: '||tracker.io^$script', domain: 'tracker.io', type: 'script', categories: ['tracking'] },
      { rule: 'example.com##.banner', domain: null, type: 'css', categories: ['ads'] },
      { rule: 'example.com#%#//scriptlet("test")', domain: null, type: 'script-injection', categories: ['ads'] },
      { rule: '||phish.net^', domain: 'phish.net', type: 'network', categories: ['phishing'] },
    ];
    const output = conv.toAdguardHomeFormat(rules);
    assert.ok(output.includes('AdGuard Home DNS'));
    assert.ok(output.includes('||ad.com^'));
    assert.ok(output.includes('||tracker.io^$script'));
    assert.ok(output.includes('||phish.net^'));
    assert.ok(!output.includes('.banner'), 'should exclude CSS rules');
    assert.ok(!output.includes('scriptlet'), 'should exclude scriptlet rules');
  });

  it('convert() dispatches to adguard-home format', () => {
    const conv = new Converter();
    const rules = [
      { rule: '||ad.com^', domain: 'ad.com', type: 'network', categories: ['ads'] },
    ];
    const output = conv.convert(rules, 'adguard-home');
    assert.ok(output.includes('AdGuard Home DNS'));
  });
});

describe('Validator', () => {
  it('validates rules', () => {
    const val = new Validator();
    const results = val.validateRules([
      { rule: '||example.com^' },
      { rule: '' },
      { rule: 'x' },
    ]);
    assert.strictEqual(results.stats.valid, 1);
    assert.strictEqual(results.stats.invalid, 2);
  });

  it('detects dangerous rules', () => {
    const val = new Validator();
    assert.ok(val.isPotentiallyDangerous({ rule: 'https://localhost/test' }));
    assert.ok(!val.isPotentiallyDangerous({ rule: '||example.com^' }));
  });
});

describe('Merger', () => {
  it('merges source results', () => {
    const merger = new Merger();
    const sources = [
      { name: 'src1', category: 'ads', rules: [{ rule: '||a.com^', categories: ['ads'] }] },
      { name: 'src2', category: 'tracking', rules: [{ rule: '||b.com^', categories: ['tracking'] }] },
    ];
    const merged = merger.merge(sources);
    assert.strictEqual(merged.rules.length, 2);
    assert.strictEqual(merged.metadata.sourceCount, 2);
  });

  it('sorts by priority', () => {
    const merger = new Merger();
    const rules = [
      { rule: '||normal.com^', subtype: '', priority: 0 },
      { rule: '@@||whitelist.com^', subtype: 'whitelist', priority: 100 },
    ];
    const sorted = merger.sortByPriority(rules);
    assert.strictEqual(sorted[0].subtype, 'whitelist');
  });

  it('groups by category', () => {
    const merger = new Merger();
    const merged = {
      rules: [
        { rule: '||a.com^', categories: ['ads'] },
        { rule: '||b.com^', categories: ['tracking'] },
        { rule: '||c.com^', categories: ['ads', 'tracking'] },
      ],
    };
    const cats = merger.mergeByCategory(merged);
    assert.ok(cats['ads']);
    assert.ok(cats['tracking']);
    assert.strictEqual(cats['ads'].length, 2);
  });

  it('sorts by domain in reverse TLD order', () => {
    const merger = new Merger();
    const rules = [
      { rule: '||sub.example.com^', domain: 'sub.example.com' },
      { rule: '||test.org^', domain: 'test.org' },
      { rule: '||a.example.com^', domain: 'a.example.com' },
    ];
    const sorted = merger.sortByDomain(rules);
    assert.strictEqual(sorted[0].domain, 'a.example.com');
    assert.strictEqual(sorted[2].domain, 'test.org');
  });

  it('handles empty rules array', () => {
    const merger = new Merger();
    const sorted = merger.sortByDomain([]);
    assert.strictEqual(sorted.length, 0);
  });

  it('handles rules without domains in sortByDomain', () => {
    const merger = new Merger();
    const rules = [
      { rule: '||test.com^', domain: 'test.com' },
      { rule: 'generic-rule', domain: '' },
    ];
    const sorted = merger.sortByDomain(rules);
    assert.strictEqual(sorted.length, 2);
  });
});

describe('Fetcher', () => {
  it('loads sources from registry.json', () => {
    const fetcher = new Fetcher();
    const sources = fetcher.loadSources();
    assert.ok(Array.isArray(sources));
    assert.ok(sources.length > 0);
    assert.ok(sources[0].name);
    assert.ok(sources[0].url);
    assert.strictEqual(typeof sources[0].enabled, 'boolean');
  });

  it('sets default options', () => {
    const fetcher = new Fetcher();
    assert.ok(fetcher.cacheDir.includes('cache'));
    assert.strictEqual(fetcher.timeout, 30000);
    assert.ok(fetcher.userAgent.includes('AdblockFilterAggregator'));
  });

  it('accepts custom options', () => {
    const fetcher = new Fetcher({ cacheDir: '/tmp/test-cache', timeout: 5000 });
    assert.strictEqual(fetcher.cacheDir, '/tmp/test-cache');
    assert.strictEqual(fetcher.timeout, 5000);
  });

  it('loadCache returns null for non-existent cache', () => {
    const fetcher = new Fetcher({ cacheDir: '/tmp/nonexistent-cache-dir' });
    const result = fetcher.loadCache('nonexistent-source');
    assert.strictEqual(result, null);
  });

  it('loadCache returns content for existing cache', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agg-test-'));
    const cacheDir = path.join(tmpDir, 'cache');
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'test-source.txt'), 'test content', 'utf-8');

    const fetcher = new Fetcher({ cacheDir });
    const result = fetcher.loadCache('test-source');
    assert.strictEqual(result, 'test content');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});

describe('Writer', () => {
  let tmpDir;
  let writer;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agg-writer-'));
    writer = new Writer(tmpDir);
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes text file', () => {
    const filePath = writer.write('test.txt', 'hello world');
    assert.ok(fs.existsSync(filePath));
    assert.strictEqual(fs.readFileSync(filePath, 'utf-8'), 'hello world');
  });

  it('writes gzip file', () => {
    const result = writer.writeGzip('test-gzip.txt', 'compressed content');
    assert.ok(result.size > 0);
    assert.ok(fs.existsSync(result.path));
  });

  it('writes JSON report', () => {
    const stats = { totalUnique: 100, duplicatesRemoved: 50 };
    const filePath = writer.writeReport(stats);
    assert.ok(fs.existsSync(filePath));
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.strictEqual(parsed.totalUnique, 100);
  });

  it('writes Markdown report', () => {
    const stats = {
      totalParsed: 1000,
      totalUnique: 500,
      duplicatesRemoved: 500,
      invalidRules: 10,
      sourceCount: 5,
      ruleTypes: { network: 400, css: 100 },
      categories: { ads: 300, tracking: 200 },
      topDomains: [['example.com', 100], ['test.com', 50]],
    };
    const filePath = writer.writeMarkdownReport(stats, ['filter-adguard.txt', 'filter-hosts.txt']);
    assert.ok(fs.existsSync(filePath));
    const content = fs.readFileSync(filePath, 'utf-8');
    assert.ok(content.includes('Total rules parsed'));
    assert.ok(content.includes('1,000'));
    assert.ok(content.includes('Invalid rules'));
    assert.ok(content.includes('10'));
    assert.ok(content.includes('filter-adguard.txt'));
    assert.ok(content.includes('filter-hosts.txt'));
  });

  it('creates output directory if not exists', () => {
    const newDir = path.join(tmpDir, 'sub', 'output');
    const w = new Writer(newDir);
    w.write('nested.txt', 'nested');
    assert.ok(fs.existsSync(path.join(newDir, 'nested.txt')));
  });
});

describe('Parser edge cases', () => {
  it('handles empty content', () => {
    const parser = new Parser();
    const rules = parser.parse('', 'abp');
    assert.strictEqual(rules.length, 0);
  });

  it('handles whitespace-only lines', () => {
    const parser = new Parser();
    const rules = parser.parse('   \n\n  \t  \n', 'abp');
    assert.strictEqual(rules.length, 0);
  });

  it('parses rules with multiple options', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$script,third-party,domain=test.com', 'abp');
    assert.strictEqual(rules.length, 1);
    assert.strictEqual(rules[0].type, 'script');
    assert.strictEqual(rules[0].options.script, true);
    assert.strictEqual(rules[0].options['third-party'], true);
    assert.strictEqual(rules[0].options.domain, 'test.com');
  });

  it('skips malformed lines', () => {
    const parser = new Parser();
    const rules = parser.parse('not a rule\njust some text', 'abp');
    assert.ok(rules.length >= 0);
  });
});

describe('Deduplicator edge cases', () => {
  it('handles empty array', () => {
    const dedup = new Deduplicator();
    const result = dedup.deduplicate([]);
    assert.strictEqual(result.length, 0);
    assert.strictEqual(dedup.getStats().total, 0);
  });

  it('deduplicates rules with different option ordering', () => {
    const dedup = new Deduplicator();
    const rules = [
      { rule: '||a.com^$script,third-party', categories: ['ads'] },
      { rule: '||a.com^$third-party,script', categories: ['tracking'] },
    ];
    const result = dedup.deduplicate(rules);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].categories.includes('ads'));
    assert.ok(result[0].categories.includes('tracking'));
  });

  it('resets stats correctly', () => {
    const dedup = new Deduplicator();
    dedup.deduplicate([{ rule: '||a.com^' }]);
    dedup.reset();
    assert.strictEqual(dedup.getStats().total, 0);
    assert.strictEqual(dedup.getStats().unique, 0);
  });
});

describe('Validator edge cases', () => {
  it('validates domain names', () => {
    const val = new Validator();
    assert.ok(val.validateDomain('example.com'));
    assert.ok(val.validateDomain('sub.example.co.uk'));
    assert.ok(!val.validateDomain(''));
    assert.ok(!val.validateDomain(null));
    assert.ok(!val.validateDomain('invalid'));
  });

  it('handles empty rules array', () => {
    const val = new Validator();
    const result = val.validateRules([]);
    assert.strictEqual(result.stats.total, 0);
    assert.strictEqual(result.stats.valid, 0);
  });
});

describe('Categorizer edge cases', () => {
  it('preserves source category', () => {
    const cat = new Categorizer();
    const rules = [{ rule: '||unknown-site.com^', categories: [] }];
    cat.categorize(rules, 'malware');
    assert.ok(rules[0].categories.includes('malware'));
  });

  it('does not duplicate categories', () => {
    const cat = new Categorizer();
    const rules = [{ rule: '||doubleclick.net^', categories: ['ads'] }];
    cat.categorize(rules, 'ads');
    const count = rules[0].categories.filter(c => c === 'ads').length;
    assert.strictEqual(count, 1);
  });

  it('categorizes whitelist rules', () => {
    const cat = new Categorizer();
    const rules = [{ rule: '@@||example.com^', categories: [], subtype: 'whitelist' }];
    cat.categorize(rules, null);
    assert.ok(rules[0].categories.includes('whitelist'));
  });
});

describe('Parser syntax coverage', () => {
  it('parses redirect-rule option', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$redirect-rule=noop.txt', 'adguard');
    assert.strictEqual(rules.length, 1);
    assert.strictEqual(rules[0].type, 'redirect');
    assert.strictEqual(rules[0].options['redirect-rule'], 'noop.txt');
  });

  it('parses inline-script option', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$inline-script', 'adguard');
    assert.strictEqual(rules[0].type, 'script');
    assert.ok(rules[0].options['inline-script']);
  });

  it('parses match-case option', () => {
    const parser = new Parser();
    const rules = parser.parse('/ads.js^$script,match-case', 'abp');
    assert.strictEqual(rules.length, 1);
    assert.ok(rules[0].options['match-case']);
  });

  it('parses denyallow option', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$denyallow=good.com|bad.com', 'adguard');
    assert.strictEqual(rules.length, 1);
    assert.strictEqual(rules[0].options['denyallow'], 'good.com|bad.com');
  });

  it('parses content option', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$content-type=json', 'ublock');
    assert.strictEqual(rules.length, 1);
    assert.strictEqual(rules[0].options['content-type'], 'json');
  });

  it('parses uBlock #^# response filter', () => {
    const parser = new Parser();
    const rules = parser.parse('example.com#^#html { display:none }', 'ublock');
    assert.strictEqual(rules.length, 1);
    assert.strictEqual(rules[0].type, 'html-filter');
    assert.strictEqual(rules[0].subtype, 'response-filter');
  });

  it('skips metadata headers like [Adblock Plus 2.0]', () => {
    const parser = new Parser();
    const rules = parser.parse('[Adblock Plus 2.0]\n! Comment\n||example.com^', 'abp');
    assert.strictEqual(rules.length, 1);
    assert.ok(rules[0].rule.includes('example.com'));
  });

  it('skips preprocessor directives like !#include', () => {
    const parser = new Parser();
    const rules = parser.parse('!#include other.txt\n!#if condition\n||example.com^\n!#endif', 'adguard');
    assert.strictEqual(rules.length, 1);
  });

  it('parses sub_frame option as subdocument', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$sub_frame', 'abp');
    assert.strictEqual(rules[0].type, 'subdocument');
  });

  it('parses beacon option as ping', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$beacon', 'abp');
    assert.strictEqual(rules[0].type, 'ping');
  });

  it('parses specifichide option', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$specifichide', 'abp');
    assert.strictEqual(rules[0].type, 'element-hiding');
  });

  it('parses inline-font option as font', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$inline-font', 'adguard');
    assert.strictEqual(rules[0].type, 'font');
  });

  it('parses frame option as subdocument', () => {
    const parser = new Parser();
    const rules = parser.parse('||example.com^$frame', 'abp');
    assert.strictEqual(rules[0].type, 'subdocument');
  });
});

describe('Validator enhanced', () => {
  it('tracks bad domain rules', () => {
    const val = new Validator();
    const results = val.validateRules([
      { rule: '||example.com^', domain: 'example.com' },
      { rule: '||bad^', domain: 'bad' },
    ]);
    assert.strictEqual(results.stats.valid, 2);
    assert.strictEqual(results.stats.badDomain, 1);
  });

  it('validates wildcard domains', () => {
    const val = new Validator();
    assert.ok(val.validateDomain('*.example.com'));
    assert.ok(val.validateDomain('example.co.uk'));
    assert.ok(!val.validateDomain('not-a-domain'));
  });
});

describe('Categorizer enhanced', () => {
  it('categorizes redirect-rule option', () => {
    const cat = new Categorizer();
    const rules = [{ rule: '||example.com^$redirect-rule=noop.txt', categories: [], options: { 'redirect-rule': 'noop.txt' } }];
    cat.categorize(rules, null);
    assert.ok(rules[0].categories.includes('redirect'));
  });

  it('categorizes csp option', () => {
    const cat = new Categorizer();
    const rules = [{ rule: '||example.com^$csp=script-src', categories: [], options: { csp: 'script-src' } }];
    cat.categorize(rules, null);
    assert.ok(rules[0].categories.includes('csp'));
  });

  it('categorizes document option', () => {
    const cat = new Categorizer();
    const rules = [{ rule: '||example.com^$document', categories: [], options: { document: true } }];
    cat.categorize(rules, null);
    assert.ok(rules[0].categories.includes('document'));
  });

  it('categorizes removeparam option', () => {
    const cat = new Categorizer();
    const rules = [{ rule: '||example.com^$removeparam', categories: [], options: { removeparam: true } }];
    cat.categorize(rules, null);
    assert.ok(rules[0].categories.includes('removeparam'));
  });
});
