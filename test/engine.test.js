const { describe, it } = require('node:test');
const assert = require('node:assert');

const Parser = require('../src/parser');
const Deduplicator = require('../src/deduplicator');
const Categorizer = require('../src/categorizer');
const Converter = require('../src/converter');
const Validator = require('../src/validator');
const Merger = require('../src/merger');

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
});
