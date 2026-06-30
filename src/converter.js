const { beijingISO } = require('./time');

class Converter {

  constructor() {
    this.platformSafelist = new Set([
      'alicdn.com', 'alibaba.com', 'alipay.com', 'aliyuncs.com',
      'amazon.com', 'amazonaws.com',
      'apple.com', 'apple-dns.net', 'icloud.com',
      'azure.com', 'azureedge.net', 'azurewebsites.net',
      'baidu.com', 'baidustatic.com', 'bdstatic.com', 'bdimg.com',
      'bilibili.com', 'bilivideo.com',
      'bing.com',
      'blogspot.com',
      'cdnjs.cloudflare.com',
      'cloudflare.com', 'cloudflare-dns.com',
      'cloudfront.net',
      'digitaloceanspaces.com',
      'discord.com', 'discordapp.com', 'discord.gg',
      'douyin.com', 'douyinvod.com',
      'dropbox.com', 'dropboxusercontent.com',
      'facebook.com', 'fb.com', 'fbcdn.net', 'facebook.net', 'fbsbx.com',
      'fastly.net',
      'firebaseio.com', 'firebasestorage.googleapis.com',
      'github.com', 'github.io', 'githubassets.com', 'githubusercontent.com',
      'gmail.com', 'googlemail.com',
      'google.com', 'googleapis.com', 'gstatic.com', 'googlevideo.com',
      'gtimg.com',
      'herokuapp.com',
      'icloud.com',
      'ifeng.com', 'ifengimg.com',
      'instagram.com', 'cdninstagram.com',
      'jsdelivr.net',
      'jd.com', 'jdpay.com',
      'linkedin.com', 'licdn.com',
      'live.com', 'microsoft.com', 'microsoftonline.com', 'msn.com',
      'meituan.com', 'meituan.net',
      'netflix.com', 'nflxvideo.net', 'nflximg.net',
      'notion.so', 'notion-static.com',
      'office.com', 'office.net', 'office365.com',
      'onelink.me',
      'pages.dev',
      'paypal.com', 'paypalobjects.com',
      'pinterest.com', 'pinimg.com',
      'qq.com', 'qpic.cn', 'qlogo.cn',
      'reddit.com', 'redd.it', 'redditmedia.com', 'redditstatic.com',
      'r2.dev',
      'sina.com.cn', 'sinaimg.cn', 'weibo.com',
      'slack.com', 'slack-edge.com',
      'sohu.com',
      'spotify.com', 'scdn.co',
      'stackoverflow.com', 'stackexchange.com',
      'steampowered.com', 'steamcommunity.com',
      'storage.googleapis.com',
      'taobao.com',
      'telegram.org', 't.me',
      'tencent.com', 'tcdn.com',
      'tiktok.com', 'tiktokcdn.com', 'byteoversea.com',
      'toutiao.com', 'toutiaoimg.com',
      'twitch.tv', 'ttvnw.net',
      'twitter.com', 'twimg.com', 'x.com',
      'unpkg.com',
      'vercel.app', 'vercel.com',
      'vimeo.com', 'vimeocdn.com',
      'weixin.com', 'wechat.com', 'wximg.com',
      'whatsapp.com', 'whatsapp.net',
      'wikipedia.org', 'wikimedia.org',
      'windows.net',
      'wordpress.com', 'wp.com',
      'xiaohongshu.com', 'xhscdn.com',
      'yahoo.com', 'yimg.com',
      'youtube.com', 'youtu.be', 'ytimg.com',
      'zoom.us',
      'zhihu.com', 'zhimg.com',
    ]);
  }

  _isSafelisted(domain) {
    if (!domain) return false;
    const parts = domain.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      const suffix = parts.slice(i).join('.');
      if (this.platformSafelist.has(suffix)) return true;
    }
    return false;
  }

  _isValidDomain(domain) {
    if (!domain || !domain.includes('.')) return false;
    const parts = domain.replace(/^\*\./, '').split('.');
    if (parts.length < 2 || parts[parts.length - 1].length < 2) return false;
    if (/[\/\$\^\*!\s\(\)\|,]/.test(domain)) return false;
    if (domain.startsWith('/') || domain.startsWith('^')) return false;
    return true;
  }

  toAdguardFormat(rules) {
    return this._toTextLines(rules, (rule) => {
      if (rule.categories && rule.categories.includes('whitelist') && !rule.rule.startsWith('@@')) {
        return '@@' + rule.rule;
      }
      return rule.rule;
    }, '! AdGuard filter list');
  }

  toAdguardHomeFormat(rules) {
    const dnsRules = rules.filter(r => {
      if (!r.domain) return false;
      if (r.type === 'css' || r.type === 'css-extended' ||
          r.type === 'script-injection' || r.type === 'html-filter' ||
          r.type === 'element-hiding') return false;
      return true;
    });

    return this._toTextLines(dnsRules, (rule) => {
      return rule.rule;
    }, `! AdGuard Home DNS filter list`);
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
      chunks.push(`! Generated: ${beijingISO()}`);
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
      `# Generated: ${beijingISO()}`,
      `# Rules: ${rules.length}`,
      '0.0.0.0 localhost',
      '',
    ];

    const seen = new Set();
    for (let i = 0; i < rules.length; i++) {
      const domain = rules[i].domain;
      if (domain && !seen.has(domain) && !this._isSafelisted(domain)) {
        seen.add(domain);
        chunks.push(`0.0.0.0 ${domain}`);
      }
    }

    return chunks.join('\n');
  }

  toDnsmasqFormat(rules) {
    const chunks = [
      '# Dnsmasq',
      `# Generated: ${beijingISO()}`,
      `# Rules: ${rules.length}`,
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain) && !this._isSafelisted(domain)) {
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
      `# Generated: ${beijingISO()}`,
      `# Rules: ${rules.length}`,
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain) && !this._isSafelisted(domain)) {
        seen.add(domain);
        chunks.push(`local-zone: "${domain}" always_nxdomain`);
      }
    }

    return chunks.join('\n');
  }

  toBindFormat(rules) {
    const chunks = [
      '# BIND RPZ',
      `; ${beijingISO()}`,
      `; Rules: ${rules.length}`,
      '$TTL 1H',
      '@ SOA localhost. root.localhost. (1 1h 15m 30d 2h)',
      '  NS localhost.',
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain) && !this._isSafelisted(domain)) {
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
      `# Generated: ${beijingISO()}`,
      `# Rules: ${rules.length}`,
      '',
    ];

    const seen = new Set();
    for (const rule of rules) {
      const domain = rule.domain;
      if (domain && !seen.has(domain) && !this._isSafelisted(domain)) {
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

  _priorityScore(categories) {
    if (!categories || categories.length === 0) return 1;
    let score = 0;
    const high = ['ads', 'tracking', 'malware', 'phishing', 'mining', 'spam', 'popup', 'ads-malware-tracking', 'ads-malware'];
    const med = ['annoyances', 'cookies', 'abuse', 'spyware', 'privacy', 'ads-regional'];
    for (const c of categories) {
      if (high.includes(c)) score += 10;
      else if (med.includes(c)) score += 5;
      else score += 1;
    }
    return score;
  }

  _selectTopDomains(rules, limit) {
    const domainMap = new Map();
    for (const rule of rules) {
      const d = rule.domain;
      if (!d || !this._isValidDomain(d) || this._isSafelisted(d)) continue;
      const existing = domainMap.get(d);
      if (existing) {
        existing.count++;
        existing.score += this._priorityScore(rule.categories);
      } else {
        domainMap.set(d, { domain: d, count: 1, score: this._priorityScore(rule.categories) });
      }
    }
    const sorted = [...domainMap.values()].sort((a, b) => b.score - a.score || b.count - a.count);
    return sorted.slice(0, limit).map(e => e.domain);
  }

  toShadowrocketConf(rules, repo) {
    return this.toShadowrocketLite(rules, 15000, repo, true);
  }

  toShadowrocketRules(rules) {
    return this.toShadowrocketLite(rules, 15000, null, false);
  }

  toShadowrocketLite(rules, limit, repo, isConf) {
    limit = limit || 15000;
    const topDomains = this._selectTopDomains(rules, limit);

    const chunks = [
      '# Shadowrocket AdBlock Rules',
      `# Generated: ${beijingISO()}`,
      `# Total source rules: ${rules.length.toLocaleString()}`,
      `# Lite rules (top domains): ${topDomains.length.toLocaleString()}`,
      `# GitHub: https://github.com/${repo || 'wansheng8/RuleSat'}`,
      '#',
      '# NOTE: Shadowrocket works best with < 15000 rules.',
      '# This lite version targets ad/tracking/malware domains only.',
      '# Major platform domains (Google, YouTube, Facebook, etc.) are excluded.',
      '# For DNS-level blocking use filter-hosts.txt or filter-domains.txt instead.',
      '',
    ];

    if (isConf) {
      chunks.push('[General]');
      chunks.push('bypass-system = true');
      chunks.push('skip-proxy = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local, captive.apple.com');
      chunks.push('tun-excluded-routes = 10.0.0.0/8, 100.64.0.0/10, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.0.0.0/24, 192.0.2.0/24, 192.88.99.0/24, 192.168.0.0/16, 198.51.100.0/24, 203.0.113.0/24, 224.0.0.0/4, 255.255.255.255/32, 239.255.255.250/32');
      chunks.push('dns-server = system');
      chunks.push('fallback-dns-server = system');
      chunks.push('ipv6 = true');
      chunks.push('prefer-ipv6 = false');
      chunks.push('dns-direct-system = false');
      chunks.push('icmp-auto-reply = true');
      chunks.push('always-reject-url-rewrite = false');
      chunks.push('private-ip-answer = true');
      chunks.push('dns-direct-fallback-proxy = false');
      chunks.push('udp-policy-not-supported-behaviour = REJECT');
      chunks.push('use-local-host-item-for-proxy = false');
      chunks.push('');
      chunks.push('[Rule]');
    } else {
      chunks.push('# Import: Shadowrocket > Config > Rule > Update Rule List');
      chunks.push('');
    }

    for (const domain of topDomains) {
      if (!this._isValidDomain(domain) && !this._isValidDomain(domain.replace(/^\*\./, ''))) continue;
      if (domain.startsWith('*.')) {
        chunks.push(`DOMAIN-SUFFIX,${domain.slice(2)},REJECT`);
      } else {
        chunks.push(`DOMAIN-SUFFIX,${domain},REJECT`);
      }
    }

    if (isConf) {
      chunks.push('');
      chunks.push('# --- Add your proxy/routing rules below ---');
      chunks.push('# GEOIP,CN,DIRECT');
      chunks.push('# FINAL,PROXY');
      chunks.push('');
      chunks.push('[Host]');
      chunks.push('localhost = 127.0.0.1');
      chunks.push('');
      chunks.push('[URL Rewrite]');
      chunks.push('');
      chunks.push('[MITM]');
    }

    return chunks.join('\n');
  }

  convert(rules, format, repo) {
    switch (format) {
      case 'adguard': return this.toAdguardFormat(rules);
      case 'adguard-home': return this.toAdguardHomeFormat(rules);
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
