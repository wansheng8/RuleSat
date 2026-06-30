const fs = require('fs');
const path = require('path');
const { beijingISO } = require('./time');

class Fetcher {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, '..', '..', 'cache');
    this.timeout = options.timeout || 30000;
    this.userAgent = options.userAgent ||
      'Mozilla/5.0 (compatible; AdblockFilterAggregator/1.0)';
  }

  async fetch(sources) {
    const results = [];
    for (const source of sources.filter(s => s.enabled)) {
      try {
        console.log(`[fetch] ${source.name}`);
        const content = await this.fetchSource(source);
        results.push({ ...source, content, fetchedAt: beijingISO() });
      } catch (err) {
        console.error(`[fetch] ${source.name} FAILED: ${err.message}`);
        const cached = this.loadCache(source.name);
        if (cached) {
          console.log(`[fetch] ${source.name} using cache`);
          results.push({ ...source, content: cached, fetchedAt: 'cache' });
        }
      }
    }
    return results;
  }

  async fetchSource(source) {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    let url = source.url;
    if (typeof source.url === 'function') url = source.url();

    let body;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      body = await this.httpGet(url);
    } else if (fs.existsSync(url)) {
      body = fs.readFileSync(url, 'utf-8');
    } else {
      throw new Error(`Cannot fetch ${url}`);
    }

    const cacheFile = path.join(this.cacheDir, `${source.name}.txt`);
    fs.writeFileSync(cacheFile, body, 'utf-8');

    return body;
  }

  async httpGet(url, redirectCount = 0) {
    const MAX_REDIRECTS = 10;
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? require('https') : require('http');
      const req = proto.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectCount >= MAX_REDIRECTS) {
            reject(new Error(`Too many redirects (max ${MAX_REDIRECTS})`));
            return;
          }
          this.httpGet(new URL(res.headers.location, url).href, redirectCount + 1)
            .then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
  }

  loadCache(name) {
    const cacheFile = path.join(this.cacheDir, `${name}.txt`);
    if (fs.existsSync(cacheFile)) {
      return fs.readFileSync(cacheFile, 'utf-8');
    }
    return null;
  }

  loadSources() {
    const registryPath = path.join(__dirname, 'sources', 'registry.json');
    return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  }
}

module.exports = Fetcher;
