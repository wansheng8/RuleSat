class Merger {
  constructor(options = {}) {
    this.stripComments = options.stripComments !== false;
    this.sortRules = options.sortRules !== false;
  }

  merge(sourceResults) {
    const merged = {
      rules: [],
      metadata: {
        sourceCount: sourceResults.length,
        mergedAt: new Date().toISOString(),
        sources: [],
      },
    };

    for (const result of sourceResults) {
      merged.metadata.sources.push({
        name: result.name,
        category: result.category,
        ruleCount: result.rules ? result.rules.length : 0,
      });

      if (result.rules) {
        for (const r of result.rules) {
          merged.rules.push(r);
        }
      }
    }

    return merged;
  }

  mergeByCategory(merged) {
    const categories = {};

    for (const rule of merged.rules) {
      const cats = rule.categories || [];
      if (cats.length === 0) {
        if (!categories['uncategorized']) categories['uncategorized'] = [];
        categories['uncategorized'].push(rule);
      } else {
        for (const cat of cats) {
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(rule);
        }
      }
    }

    return categories;
  }

  sortByPriority(rules) {
    const withKey = new Array(rules.length);
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      const isWhitelist = r.subtype === 'whitelist' ? 0 : 1;
      const prio = 9999 - (r.priority || 0);
      withKey[i] = {
        rule: r,
        key: `${isWhitelist}_${String(prio).padStart(5, '0')}_${i}`,
      };
    }
    withKey.sort((a, b) => a.key.localeCompare(b.key));
    for (let i = 0; i < withKey.length; i++) {
      rules[i] = withKey[i].rule;
    }
    return rules;
  }

  sortByDomain(rules) {
    const withKey = new Array(rules.length);
    for (let i = 0; i < rules.length; i++) {
      const d = rules[i].domain || '';
      withKey[i] = {
        rule: rules[i],
        key: d.split('.').reverse().join('.') + '_' + String(i).padStart(10, '0'),
      };
    }
    withKey.sort((a, b) => a.key.localeCompare(b.key));
    for (let i = 0; i < withKey.length; i++) {
      rules[i] = withKey[i].rule;
    }
    return rules;
  }

  getDomainStats(rules) {
    const domains = new Map();
    const limit = Math.min(rules.length, 500000);
    for (let i = 0; i < limit; i++) {
      const rule = rules[i];
      if (!rule.domain) continue;
      const parts = rule.domain.split('.');
      const tld = parts.length > 1 ? parts.slice(-2).join('.') : parts[0];
      domains.set(tld, (domains.get(tld) || 0) + 1);
    }
    const entries = [];
    for (const [domain, count] of domains) {
      entries.push([domain, count]);
    }
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 50);
  }

  getRuleTypeStats(rules) {
    const types = {};
    for (const rule of rules) {
      types[rule.type] = (types[rule.type] || 0) + 1;
    }
    return types;
  }
}

module.exports = Merger;
