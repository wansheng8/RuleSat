const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class Writer {
  constructor(outputDir) {
    this.outputDir = outputDir || path.join(__dirname, '..', 'output');
  }

  ensureDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  write(name, content) {
    this.ensureDir();
    const filePath = path.join(this.outputDir, name);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  writeGzip(name, content) {
    this.ensureDir();
    const gzipPath = path.join(this.outputDir, name + '.gz');
    const compressed = zlib.gzipSync(content, { level: 9 });
    fs.writeFileSync(gzipPath, compressed);
    return { path: gzipPath, size: compressed.length };
  }

  writeReport(stats) {
    this.ensureDir();
    const report = JSON.stringify(stats, null, 2);
    const filePath = path.join(this.outputDir, 'report.json');
    fs.writeFileSync(filePath, report, 'utf-8');
    return filePath;
  }

  writeMarkdownReport(stats, outputFiles) {
    this.ensureDir();
    const lines = [
      '# Adblock Filter Aggregator Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Statistics',
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total rules parsed | ${stats.totalParsed?.toLocaleString() || 'N/A'} |`,
      `| Unique rules after dedup | ${stats.totalUnique?.toLocaleString() || 'N/A'} |`,
      `| Duplicates removed | ${stats.duplicatesRemoved?.toLocaleString() || 'N/A'} |`,
      `| Invalid rules | ${stats.invalidRules?.toLocaleString() || 'N/A'} |`,
      `| Sources processed | ${stats.sourceCount || 'N/A'} |`,
      '',
      '## Rule Type Distribution',
      '',
      ...(stats.ruleTypes ? Object.entries(stats.ruleTypes).map(([type, count]) =>
        `- ${type}: ${count.toLocaleString()}`) : ['- N/A']),
      '',
      '## Category Distribution',
      '',
      ...(stats.categories ? Object.entries(stats.categories).map(([cat, count]) =>
        `- ${cat}: ${count.toLocaleString()}`) : ['- N/A']),
      '',
      '## Top Domains',
      '',
      ...(stats.topDomains ? stats.topDomains.map(([domain, count]) =>
        `- ${domain}: ${count.toLocaleString()}`) : ['- N/A']),
      '',
      '## Output Files',
      '',
      ...(outputFiles ? outputFiles.map(f => `- \`${f}\``) : ['- N/A']),
    ];

    const filePath = path.join(this.outputDir, 'REPORT.md');
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    return filePath;
  }
}

module.exports = Writer;
