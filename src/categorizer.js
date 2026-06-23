class Categorizer {
  constructor() {
    this.categoryMap = {
      'ads': ['ad', 'advert', 'banner', 'doubleclick', 'adsense', 'adservice', 'adserver',
        'adsystem', 'popup', 'popunder', 'popunder', 'promoted', 'sponsored', 'taboola', 'outbrain'],
      'tracking': ['track', 'analytics', 'pixel', 'beacon', 'telemetry', 'collect', 'metrics',
        'stat', 'log', 'hit', 'pageview', 'impression', 'visitor', 'session', 'heatmap',
        'hotjar', 'mouseflow', 'fullstory', 'clicktale', 'crazyegg'],
      'privacy': ['privacy', 'gdpr', 'ccpa', 'consent', 'cookie-banner', 'cookie-notice',
        'cookie-law', 'cookie-bar', 'cookiecompliance', 'cookieconsent', 'cookiescript',
        'cookiewall', 'eu-cookie'],
      'malware': ['malware', 'virus', 'trojan', 'ransomware', 'exploit', 'backdoor', 'spyware',
        'keylogger', 'rootkit', 'botnet', 'c2', 'command-and-control'],
      'phishing': ['phish', 'phishing', 'fake', 'scam', 'fraud', 'identity', 'credential',
        'banking', 'login-steal', 'credential-harvest'],
      'social': ['facebook', 'twitter', 'instagram', 'linkedin', 'pinterest', 'reddit',
        'tumblr', 'share', 'like-button', 'social', 'vkontakte', 'weibo', 'tiktok',
        'snapchat', 'whatsapp', 'telegram', 'addthis', 'sharethis', 'disqus'],
      'cookies': ['cookie', 'cookielaw'],
      'mining': ['miner', 'mining', 'cryptonight', 'coinhive', 'cryptominer', 'webminer',
        'crypto-loot', 'coinimp', 'jsminer', 'wasm-miner'],
      'annoyances': ['newsletter', 'subscribe', 'subscription', 'push-notification',
        'notification', 'overlay', 'modal', 'lightbox', 'interstitial', 'paywall',
        'survey', 'feedback', 'chat-widget', 'livechat', 'zopim', 'intercom',
        'drift', 'tawk', 'crisp', 'hubspot'],
      'abuse': ['abuse', 'spam', 'scam', 'fraud', 'illegal', 'pirate', 'warez',
        'crack', 'keygen', 'torrent'],
      'regional-cn': ['.cn', 'baidu', 'taobao', 'tencent', 'weixin', 'qq.com',
        'sina', 'sohu', '163.com', 'alibaba', 'alipay', 'youku'],
      'regional-ru': ['.ru', 'yandex', 'mail.ru', 'vkontakte', 'odnoklassniki',
        'rambler'],
    };
  }

  categorize(rules, sourceCategory) {
    for (const rule of rules) {
      rule.categories = rule.categories || [];
      if (sourceCategory && !rule.categories.includes(sourceCategory)) {
        rule.categories.push(sourceCategory);
      }

      const text = (rule.rule + ' ' + (rule.domain || '')).toLowerCase();

      for (const [cat, keywords] of Object.entries(this.categoryMap)) {
        if (rule.categories.includes(cat)) continue;
        if (keywords.some(kw => text.includes(kw))) {
          rule.categories.push(cat);
        }
      }

      if (rule.options) {
        if (rule.options.cookie) rule.categories.push('cookies');
        if (rule.options.redirect || rule.options.rewrite) rule.categories.push('redirect');
        if (rule.options.webrtc) rule.categories.push('webrtc');
        if (rule.options.popup) rule.categories.push('popup');
        if (rule.options.font) rule.categories.push('font');
        if (rule.options.stylesheet) rule.categories.push('stylesheet');
      }

      if (rule.subtype === 'whitelist') rule.categories.push('whitelist');
      if (rule.type === 'script-injection') rule.categories.push('scriptlet');
    }

    return rules;
  }
}

module.exports = Categorizer;
