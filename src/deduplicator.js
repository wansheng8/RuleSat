const crypto = require('crypto');

class Deduplicator {
  constructor() {
    this.seen = new Map();
    this.hashSeen = new Set();
    this.stats = { total: 0, unique: 0, duplicates: 0 };
  }

  deduplicate(rules) {
    this.stats.total += rules.length;
    const unique = [];

    for (const rule of rules) {
      const key = this.getRuleKey(rule);

      const existing = this.seen.get(key);
      if (existing) {
        this.stats.duplicates++;
        existing.categories = [...new Set([...(existing.categories || []), ...(rule.categories || [])])];
        continue;
      }

      const hash = crypto.createHash('md5').update(rule.rule).digest('hex');
      if (this.hashSeen.has(hash)) {
        this.stats.duplicates++;
        continue;
      }

      this.seen.set(key, rule);
      this.hashSeen.add(hash);
      unique.push(rule);
      this.stats.unique++;
    }

    return unique;
  }

  getRuleKey(rule) {
    let normalized = rule.rule
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\/$/, '');

    if (normalized.includes('$')) {
      const [pattern, options] = normalized.split('$', 2);
      const sortedOpts = options.split(',').sort().join(',');
      normalized = `${pattern}$${sortedOpts}`;
    }

    return normalized;
  }

  getStats() {
    return { ...this.stats };
  }

  reset() {
    this.seen.clear();
    this.hashSeen.clear();
    this.stats = { total: 0, unique: 0, duplicates: 0 };
  }
}

module.exports = Deduplicator;
