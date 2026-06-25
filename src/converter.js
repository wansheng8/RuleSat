class Converter {

  toAdguardFormat(rules) {
    return this._toTextLines(rules, (rule) => {
      if (rule.categories && rule.categories.includes('whitelist') && !rule.rule.startsWith('@@')) {
        return '@@' + rule.rule;
      }
      return rule.rule;
    }, '! AdGuard filter list');
  }

  toUblockOriginFormat(rules) {
    return this._toTextLines(rules, (rule) => rule.rule, '! uBlock Origin filter list');
  }

  toAdblockPlusFormat(rules) {
    const header = ['[Adblock Plus 2.0]', `! Rules: ${rules.length}`, ''].join('\n');
    return header + this._toTextLines(rules, (rule) => rule.rule, null);
  }

  _toTextLines(rules, transform, header) {
    const chunkSize = 50000;
    const chunks = [];

    if (header) {
      chunks.push(header);
      chunks.push(`! Generated: ${new Date().toISOString()}`);
      chunks.push(`! Rules: ${rules.length}`);
      chunks.push('');
    }

    for (let i = 0; i < rules.length; i += chunkSize) {
      const chunk = [];
      const end = Math.min(i + chunkSize, rules.length);
      for (let j = i; j < end; j++) {
        chunk.push(transform(rules[j]));
      }
      chunks.push(chunk.join('\n'));
    }

    return chunks.join('\n');
  }

  toHostsFormat(rules) {
    const chunkSize = 50000;
    const chunks = [
      '# Hosts file',
      `# Generated: ${new Date().toISOString()}`,
      `# Rules: ${rules.length}`,
      '0.0.0.0 localhost',
      '',
    ];

    const seen = new Set();
    for (let i = 0; i < rules.length; i++) {
      const domain = rules[i].domain;
      if (domain && !seen.has(domain)) {
        seen.add(domain);
        chunks.push(`0.0.0.0 ${domain}`);
      }
    }

    return chunks.join('\n');
  }

  toDnsmasqFormat(rules) {
    const chunks = [
      '# Dnsmasq',
      `# Generated: ${new Date().toISOString()}`,
      `# Rules: ${rules.length}`,
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain)) {
        seen.add(domain);
        chunks.push(`server=/${domain}/`);
        chunks.push(`address=/${domain}/0.0.0.0`);
        chunks.push(`address=/${domain}/::`);
      }
    }

    return chunks.join('\n');
  }

  toUnboundFormat(rules) {
    const chunks = [
      '# Unbound',
      `# Generated: ${new Date().toISOString()}`,
      `# Rules: ${rules.length}`,
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain)) {
        seen.add(domain);
        chunks.push(`local-zone: "${domain}" always_nxdomain`);
      }
    }

    return chunks.join('\n');
  }

  toBindFormat(rules) {
    const chunks = [
      '# BIND RPZ',
      `; ${new Date().toISOString()}`,
      `; Rules: ${rules.length}`,
      '$TTL 1H',
      '@ SOA localhost. root.localhost. (1 1h 15m 30d 2h)',
      '  NS localhost.',
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain)) {
        seen.add(domain);
        chunks.push(`${domain} CNAME .`);
        chunks.push(`*.${domain} CNAME .`);
      }
    }

    return chunks.join('\n');
  }

  toDomainList(rules) {
    const chunks = [
      '# Domain blocklist',
      `# Generated: ${new Date().toISOString()}`,
      `# Rules: ${rules.length}`,
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain)) {
        seen.add(domain);
        chunks.push(domain);
      }
    }

    return chunks.join('\n');
  }

  toJson(rules) {
    const chunkSize = 10000;
    const chunks = ['['];
    for (let i = 0; i < rules.length; i += chunkSize) {
      if (i > 0) chunks.push(',');
      const slice = [];
      for (let j = i; j < Math.min(i + chunkSize, rules.length); j++) {
        const r = rules[j];
        slice.push(JSON.stringify({
          r: r.rule,
          t: r.type,
          s: r.subtype,
          d: r.domain,
          c: r.categories,
        }));
      }
      chunks.push(slice.join(','));
    }
    chunks.push(']');
    return chunks.join('');
  }

  toShadowrocketConf(rules, repo) {
    const chunks = [
      '# Shadowrocket AdBlock Config',
      `# Generated: ${new Date().toISOString()}`,
      `# Rules: ${rules.length}`,
      `# GitHub: https://github.com/${repo}`,
      '',
      '[General]',
      'bypass-system = true',
      'skip-proxy = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local',
      'bypass-tun = 10.0.0.0/8, 100.64.0.0/10, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.0.0.0/24, 192.0.2.0/24, 192.168.0.0/16, 198.18.0.0/15, 198.51.100.0/24, 203.0.113.0/24, 224.0.0.0/4, 255.255.255.255/32',
      'dns-server = system, 223.5.5.5, 119.29.29.29',
      '',
      '[Rule]',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain)) {
        seen.add(domain);
        if (domain.startsWith('*.')) {
          chunks.push(`DOMAIN-SUFFIX,${domain.slice(2)},REJECT`);
        } else {
          chunks.push(`DOMAIN-SUFFIX,${domain},REJECT`);
        }
      }
    }

    chunks.push('', '# Custom proxy rules - add your own below', '# DOMAIN-SUFFIX,google.com,PROXY', '# GEOIP,CN,DIRECT', 'FINAL,DIRECT', '', '[URL Rewrite]', '', '[MITM]', '');

    return chunks.join('\n');
  }

  toShadowrocketRules(rules) {
    const chunks = [
      '# Shadowrocket AdBlock Rules',
      `# Generated: ${new Date().toISOString()}`,
      `# Rules: ${rules.length}`,
      '# Import via Shadowrocket > Config > Rule > Update Rule List',
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain)) {
        seen.add(domain);
        if (domain.startsWith('*.')) {
          chunks.push(`DOMAIN-SUFFIX,${domain.slice(2)},REJECT`);
        } else {
          chunks.push(`DOMAIN-SUFFIX,${domain},REJECT`);
        }
      }
    }

    return chunks.join('\n');
  }

  convert(rules, format, repo) {
    switch (format) {
      case 'adguard': return this.toAdguardFormat(rules);
      case 'ublock': return this.toUblockOriginFormat(rules);
      case 'abp': return this.toAdblockPlusFormat(rules);
      case 'hosts': return this.toHostsFormat(rules);
      case 'dnsmasq': return this.toDnsmasqFormat(rules);
      case 'unbound': return this.toUnboundFormat(rules);
      case 'bind': return this.toBindFormat(rules);
      case 'domain-list': return this.toDomainList(rules);
      case 'json': return this.toJson(rules);
      case 'shadowrocket-conf': return this.toShadowrocketConf(rules, repo || 'wansheng8/RuleSat');
      case 'shadowrocket-rules': return this.toShadowrocketRules(rules);
      default: return this.toAdguardFormat(rules);
    }
  }
}

module.exports = Converter;
