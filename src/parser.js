class Parser {
  constructor() {
    this.stats = { total: 0, parsed: 0, skipped: 0, comments: 0, empty: 0 };
  }

  parse(content, sourceFormat) {
    const lines = content.split(/\r?\n/);
    const rules = [];
    this.stats.total = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line) {
        this.stats.empty++;
        continue;
      }

      if (line.startsWith('!') || line.startsWith('#') && !this.isAbpRule(line)) {
        this.stats.comments++;
        continue;
      }

      const rule = this.parseLine(line, sourceFormat);
      if (rule) {
        rules.push(rule);
        this.stats.parsed++;
      } else {
        this.stats.skipped++;
      }
    }

    return rules;
  }

  parseLine(line, sourceFormat) {
    if (sourceFormat === 'hosts') return this.parseHostsLine(line);
    if (sourceFormat === 'domain' || sourceFormat === 'domain-wild') return this.parseDomainLine(line, sourceFormat);
    return this.parseAdblockLine(line);
  }

  parseHostsLine(line) {
    const cleaned = line.replace(/^0\.0\.0\.0\s+|^127\.0\.0\.1\s+|^::1\s+|^0\s+/, '').trim();
    if (!cleaned || cleaned.startsWith('#') || cleaned === 'localhost' || cleaned === 'localhost.localdomain') {
      return null;
    }
    const domain = cleaned.split(/[#\s]/)[0].trim().toLowerCase();
    if (!domain || !domain.includes('.')) return null;

    return {
      type: 'network',
      subtype: 'domain',
      rule: `||${domain}^`,
      domain,
      priority: 0,
      categories: [],
      source: 'hosts',
    };
  }

  parseDomainLine(line, format) {
    const cleaned = line.replace(/^0\.0\.0\.0\s+|^127\.0\.0\.1\s+|^::1\s+|^\|\|/, '').replace(/\^.*$/, '').trim();
    if (!cleaned || cleaned.startsWith('#') || cleaned.startsWith('!')) return null;

    const domain = cleaned.split(/[#\s]/)[0].trim().toLowerCase();
    if (!domain || !domain.includes('.')) return null;

    const suffix = format === 'domain-wild' ? '^' : '^';
    return {
      type: 'network',
      subtype: 'domain',
      rule: `||${domain}${suffix}`,
      domain,
      priority: 0,
      categories: [],
      source: format,
    };
  }

  parseAdblockLine(line) {
    const rule = { raw: line, rule: line, type: 'unknown', subtype: '', domain: null, priority: 0, categories: [] };

    if (line.startsWith('@@')) {
      rule.subtype = 'whitelist';
      rule.priority = 100;
    } else if (line.startsWith('||')) {
      rule.subtype = 'domain-anchored';
    } else if (line.startsWith('|http')) {
      rule.subtype = 'url-anchored';
    } else if (line.startsWith('|')) {
      rule.subtype = 'left-anchored';
    } else if (line.includes('##') || line.includes('#@#') || line.includes('#%#') || line.includes('#?#') || line.includes('#$#')) {
      rule.type = 'element-hiding';
      return this.parseElementHidingRule(line, rule);
    } else {
      rule.subtype = 'generic';
    }

    return this.parseNetworkRule(line, rule);
  }

  parseNetworkRule(line, rule) {
    const optionsMatch = line.match(/\$(.+)$/);
    if (optionsMatch) {
      rule.options = this.parseOptions(optionsMatch[1]);
      rule.type = this.determineNetworkType(rule.options);
    } else {
      rule.options = {};
      rule.type = 'network';
    }

    if (line.startsWith('||')) {
      const domainMatch = line.replace(/^\|\|/, '').match(/^([^/$^]+)/);
      if (domainMatch) rule.domain = domainMatch[1].toLowerCase();
    } else if (line.includes('://')) {
      try {
        const cleaned = line.replace(/^[@@|]+/, '').replace(/\$.*$/, '');
        const url = new URL(cleaned);
        rule.domain = url.hostname.toLowerCase();
      } catch {}
    }

    return rule;
  }

  parseElementHidingRule(line, rule) {
    if (line.includes('#%#')) {
      rule.subtype = 'scriptlet';
      rule.type = 'script-injection';
    } else if (line.includes('#$#')) {
      rule.subtype = 'html-filter';
      rule.type = 'html-filter';
    } else if (line.includes('#?#')) {
      rule.subtype = 'extended-css';
      rule.type = 'css-extended';
    } else if (line.includes('#@#')) {
      rule.subtype = 'css-whitelist';
      rule.type = 'css';
    } else if (line.includes('##')) {
      rule.subtype = 'css-selector';
      rule.type = 'css';
    }

    return rule;
  }

  parseOptions(optionsStr) {
    const opts = {};
    const parts = optionsStr.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('=')) {
        const [key, ...valParts] = trimmed.split('=');
        opts[key.trim()] = valParts.join('=').trim();
      } else if (trimmed.startsWith('~')) {
        opts[trimmed.slice(1)] = 'exclude';
      } else {
        opts[trimmed] = true;
      }
    }

    return opts;
  }

  determineNetworkType(options) {
    const typeMap = {
      'script': 'script',
      'image': 'image',
      'stylesheet': 'stylesheet',
      'font': 'font',
      'media': 'media',
      'object': 'object',
      'object-subrequest': 'object',
      'subdocument': 'subdocument',
      'xmlhttprequest': 'xhr',
      'xhr': 'xhr',
      'websocket': 'websocket',
      'webrtc': 'webrtc',
      'ping': 'ping',
      'other': 'other',
      'cookie': 'cookie',
      'popup': 'popup',
      'popunder': 'popup',
      'csp': 'csp',
      'document': 'document',
      'elemhide': 'element-hiding',
      'generichide': 'generic-hide',
      'genericblock': 'generic-block',
      'redirect': 'redirect',
      'rewrite': 'rewrite',
      'replace': 'replace',
      'removeparam': 'removeparam',
      'important': 'important',
      'badfilter': 'badfilter',
      'all': 'all',
      'third-party': 'third-party',
      'first-party': 'first-party',
    };

    for (const [key, type] of Object.entries(typeMap)) {
      if (options[key] !== undefined) return type;
    }

    return 'network';
  }

  isAbpRule(line) {
    return /^\|\||^@@|\$\w|##|#@#|#%#|#\?#/.test(line);
  }
}

module.exports = Parser;
