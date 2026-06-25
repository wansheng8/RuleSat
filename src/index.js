const Fetcher = require('./fetcher');
const Parser = require('./parser');
const Deduplicator = require('./deduplicator');
const Merger = require('./merger');
const Categorizer = require('./categorizer');
const Converter = require('./converter');
const Validator = require('./validator');
const Writer = require('./writer');

class AdblockFilterAggregator {
  constructor(options = {}) {
    this.fetcher = new Fetcher(options);
    this.parser = new Parser();
    this.deduplicator = new Deduplicator();
    this.merger = new Merger(options);
    this.categorizer = new Categorizer();
    this.converter = new Converter();
    this.validator = new Validator();
    this.writer = new Writer(options.outputDir);
    this.options = options;
  }

  async fetch() {
    const sources = this.fetcher.loadSources();
    console.log(`Loaded ${sources.length} sources (${sources.filter(s => s.enabled).length} enabled)`);
    const results = await this.fetcher.fetch(sources);
    return results;
  }

  parse(fetchedSources) {
    const parsedSources = [];
    let totalParsed = 0;

    for (const source of fetchedSources) {
      const rules = this.parser.parse(source.content, source.format);
      this.categorizer.categorize(rules, source.category);
      parsedSources.push({ ...source, rules, ruleCount: rules.length });
      totalParsed += rules.length;
      console.log(`[parse] ${source.name}: ${rules.length.toLocaleString()} rules`);
    }

    console.log(`[parse] total: ${totalParsed.toLocaleString()} rules from ${fetchedSources.length} sources`);
    return { parsedSources, totalParsed };
  }

  deduplicate(parsedSources) {
    let allRules = [];
    for (const src of parsedSources) {
      allRules = allRules.concat(src.rules);
    }

    console.log(`[dedup] before: ${allRules.length.toLocaleString()} rules`);
    const unique = this.deduplicator.deduplicate(allRules);
    const dedupStats = this.deduplicator.getStats();
    console.log(`[dedup] after: ${unique.length.toLocaleString()} unique (${dedupStats.duplicates.toLocaleString()} duplicates removed)`);

    return { unique, stats: dedupStats };
  }

  validate(rules) {
    const { valid, invalid, stats } = this.validator.validateRules(rules);
    console.log(`[validate] valid: ${stats.valid.toLocaleString()}, invalid: ${stats.invalid.toLocaleString()}`);
    return { valid, invalid, stats };
  }

  mergeAndOrganize(uniqueRules, parsedSources) {
    const merged = this.merger.merge(parsedSources);
    merged.rules = uniqueRules;

    const categorized = this.merger.mergeByCategory(merged);
    const sorted = this.merger.sortByPriority(uniqueRules);
    const domainStats = this.merger.getDomainStats(uniqueRules);
    const typeStats = this.merger.getRuleTypeStats(uniqueRules);

    return { merged, categorized, sorted, domainStats, typeStats };
  }

  async generateOutputs(uniqueRules, sorted) {
    const outputs = [];

    const formats = {
      'filter-adguard.txt': 'adguard',
      'filter-ublock.txt': 'ublock',
      'filter-abp.txt': 'abp',
      'filter-hosts.txt': 'hosts',
      'filter-dnsmasq.conf': 'dnsmasq',
      'filter-unbound.conf': 'unbound',
      'filter-bind-rpz.conf': 'bind',
      'filter-domains.txt': 'domain-list',
      'filter-rules.json': 'json',
      'filter-shadowrocket.conf': 'shadowrocket-conf',
      'filter-shadowrocket-rules.txt': 'shadowrocket-rules',
    };

    const repo = process.env.GITHUB_REPOSITORY || 'wansheng8/RuleSat';

    for (const [filename, format] of Object.entries(formats)) {
      try {
        const content = this.converter.convert(sorted, format, repo);
        const outPath = this.writer.write(filename, content);
        const size = Buffer.byteLength(content, 'utf-8');

        const gzipResult = this.writer.writeGzip(filename, content);
        const gzipSize = gzipResult.size;

        console.log(`[output] ${filename}: ${(size / 1024 / 1024).toFixed(2)} MB (${(gzipSize / 1024 / 1024).toFixed(2)} MB gz)`);
        outputs.push({ path: outPath, filename, format, size, gzipSize });
      } catch (err) {
        console.error(`[output] ${filename} FAILED: ${err.message}`);
        const fs = require('fs');
        const outPath = this.writer.write(filename, `# Error: ${err.message}`);
        outputs.push({ path: outPath, filename, format, size: 0, gzipSize: 0 });
      }
    }

    return outputs;
  }

  async run(options = {}) {
    const mode = options.mode || 'all';
    const steps = options.steps || 100;

    const startTime = Date.now();

    let fetchedSources = null;
    let parsedResult = null;
    let dedupResult = null;
    let organized = null;
    let outputs = null;

    if (['all', 'fetch'].includes(mode)) {
      fetchedSources = await this.fetch();
    }

    if (['all', 'parse', 'process', 'build'].includes(mode)) {
      if (!fetchedSources && ['parse', 'process', 'build'].includes(mode)) {
        fetchedSources = await this.fetch();
      }
      parsedResult = this.parse(fetchedSources);
    }

    if (['all', 'process', 'build'].includes(mode)) {
      if (!parsedResult) {
        fetchedSources = fetchedSources || await this.fetch();
        parsedResult = this.parse(fetchedSources);
      }
      dedupResult = this.deduplicate(parsedResult.parsedSources);
      organized = this.mergeAndOrganize(dedupResult.unique, parsedResult.parsedSources);
    }

    if (['all', 'build'].includes(mode)) {
      if (!organized) {
        if (!dedupResult) {
          if (!parsedResult) {
            fetchedSources = fetchedSources || await this.fetch();
            parsedResult = this.parse(fetchedSources);
          }
          dedupResult = this.deduplicate(parsedResult.parsedSources);
          organized = this.mergeAndOrganize(dedupResult.unique, parsedResult.parsedSources);
        } else {
          organized = this.mergeAndOrganize(dedupResult.unique, parsedResult ? parsedResult.parsedSources : []);
        }
      }
      outputs = await this.generateOutputs(dedupResult.unique, organized.sorted);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    const stats = {
      mode,
      elapsed: `${elapsed}s`,
      fetchedCount: fetchedSources ? fetchedSources.length : 0,
      totalParsed: parsedResult ? parsedResult.totalParsed : 0,
      totalUnique: dedupResult ? dedupResult.unique.length : 0,
      duplicatesRemoved: dedupResult ? dedupResult.stats.duplicates : 0,
      sourceCount: fetchedSources ? fetchedSources.length : 0,
      ruleTypes: organized ? organized.typeStats : {},
      categories: organized ? Object.fromEntries(
        Object.entries(organized.categorized || {}).map(([k, v]) => [k, v.length])
      ) : {},
      topDomains: organized ? organized.domainStats : [],
    };

    this.writer.writeReport(stats);

    if (outputs) {
      this.writer.writeMarkdownReport(stats, outputs.map(o => o.filename));
    }

    return {
      stats,
      outputs: outputs || [],
    };
  }
}

module.exports = AdblockFilterAggregator;
