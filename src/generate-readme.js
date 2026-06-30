const fs = require('fs');
const path = require('path');
const { beijingISOShort } = require('./time');

function fmt(n) {
  if (n == null) return 'N/A';
  return Number(n).toLocaleString();
}

function fmtMB(bytes) {
  if (!bytes) return 'N/A';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function generate(repo) {
  const reportPath = path.join(__dirname, '..', 'output', 'report.json');
  let stats = {};
  try {
    stats = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  } catch {}

  const rawBase = `https://raw.githubusercontent.com/${repo}/main/output`;
  const cdnBase = `https://cdn.jsdelivr.net/gh/${repo}@main/output`;

  const files = [
    { name: 'filter-adguard.txt',      fmt: 'AdGuard',           desc: 'AdGuard 浏览器插件' },
    { name: 'filter-adguard-home.txt', fmt: 'AdGuard Home',      desc: 'AdGuard Home DNS 过滤 (纯网络规则)' },
    { name: 'filter-ublock.txt',       fmt: 'uBlock Origin',     desc: 'uBlock Origin 浏览器插件' },
    { name: 'filter-abp.txt',          fmt: 'Adblock Plus',      desc: 'Adblock Plus 浏览器插件' },
    { name: 'filter-hosts.txt',        fmt: 'Hosts',             desc: 'Pi-hole / 标准 hosts 文件' },
    { name: 'filter-domains.txt',      fmt: '域名列表',           desc: '纯域名列表 (一行一个)' },
    { name: 'filter-dnsmasq.conf.gz',  fmt: 'Dnsmasq (gz)',      desc: 'Dnsmasq DNS 服务器 (gzip)' },
    { name: 'filter-unbound.conf',     fmt: 'Unbound',           desc: 'Unbound DNS 服务器' },
    { name: 'filter-bind-rpz.conf',    fmt: 'BIND RPZ',          desc: 'BIND DNS RPZ 区域文件' },
    { name: 'filter-rules.json.gz',    fmt: 'JSON (gz)',          desc: '完整规则数据 (gzip)' },
    { name: 'REPORT.md',               fmt: '报告',               desc: '统计报告' },
  ];

  let rows = '';
  for (const f of files) {
    const rawUrl = `${rawBase}/${f.name}`;
    const cdnUrl = `${cdnBase}/${f.name}`;
    rows += `| [${f.name}](${rawUrl}) | [CDN](${cdnUrl}) | ${f.fmt} | ${f.desc} |\n`;
  }

  const sourceList = [
    'EasyList / EasyPrivacy',
    'AdGuard Base / Tracking / Social / DNS / Spyware / Mobile / Cookies / Popup / CNAME',
    'uBlock Origin Badware / Privacy / Resource Abuse / Unbreak',
    'Fanboy Annoyance / Social',
    "Peter Lowe's Hosts",
    'StevenBlack Hosts',
    'someonewhocares Hosts',
    'oisd full',
    'HaGeZi DNS Pro / Ultimate',
    'Phishing Army',
    'NoCoin Miners',
    'Anti-PopAds',
    'Spam404',
    'URLhaus Malware',
    'EasyList China / Germany / Italy / Dutch',
    'Dan Pollock Hosts',
    'AdAway Hosts',
    'Anti-AD (Chinese)',
    'CJX Annoyance List',
    'ABP Warning Removal',
    'KADhosts',
    'Ad-Wars / YHosts (Chinese)',
  ];

  const cats = stats.categories || {};
  let catRows = '';
  for (const [name, count] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    catRows += `| ${name} | ${fmt(count)} |\n`;
  }

  const types = stats.ruleTypes || {};
  let typeRows = '';
  for (const [name, count] of Object.entries(types).sort((a, b) => b[1] - a[1])) {
    typeRows += `| ${name} | ${fmt(count)} |\n`;
  }

  const readme = `# Adblock Filter Aggregator

[![Update Filter Lists](https://github.com/${repo}/actions/workflows/update-filters.yml/badge.svg)](https://github.com/${repo}/actions/workflows/update-filters.yml)

多源广告拦截过滤规则聚合引擎。从 **${stats.sourceCount || 49}** 个公开规则源抓取、解析、去重、合并、分类，生成适用于 AdGuard、uBlock Origin、Adblock Plus 及各类 DNS 服务器的过滤规则文件。

## 实时统计

| 指标 | 数值 |
|---|---|
| 唯一规则总数 | **${fmt(stats.totalUnique)}** |
| 规则来源 | ${stats.sourceCount || 'N/A'} |
| 规则类别 | ${Object.keys(cats).length} |
| 重复移除 | ${fmt(stats.duplicatesRemoved)} |
| 最后更新 | ${beijingISOShort()} |

## 浏览器插件订阅地址

| 插件 | Raw | CDN |
|---|---|---|
| AdGuard | [订阅](${rawBase}/filter-adguard.txt) | [CDN](${cdnBase}/filter-adguard.txt) |
| uBlock Origin | [订阅](${rawBase}/filter-ublock.txt) | [CDN](${cdnBase}/filter-ublock.txt) |
| Adblock Plus | [订阅](${rawBase}/filter-abp.txt) | [CDN](${cdnBase}/filter-abp.txt) |

## DNS / Hosts 订阅地址

| 工具 | Raw | CDN |
|---|---|---|
| AdGuard Home | [订阅](${rawBase}/filter-adguard-home.txt) | [CDN](${cdnBase}/filter-adguard-home.txt) |
| Pi-hole / Hosts | [订阅](${rawBase}/filter-hosts.txt) | [CDN](${cdnBase}/filter-hosts.txt) |
| 域名列表 | [订阅](${rawBase}/filter-domains.txt) | [CDN](${cdnBase}/filter-domains.txt) |

## 所有文件下载

| 文件 (点击下载) | CDN 加速 | 格式 | 说明 |
|---|---|---|---|
${rows}

## 规则类别分布

| 类别 | 规则数 |
|---|---|
${catRows}

## 规则类型分布

| 类型 | 数量 |
|---|---|
${typeRows}

## 规则来源

${sourceList.map(s => `- ${s}`).join('\n')}

## 自动更新

每 **12 小时**通过 GitHub Actions 自动更新本 README 及所有过滤器文件。  
[查看更新历史](https://github.com/${repo}/commits/main/output)

## License

MIT
`;

  return readme;
}

function main() {
  try {
    const repo = process.env.GITHUB_REPOSITORY || process.argv[2] || 'wansheng8/RuleSat';
    const readme = generate(repo);
    const outPath = path.join(__dirname, '..', 'README.md');
    fs.writeFileSync(outPath, readme, 'utf-8');
    console.log(`[readme] generated README.md for ${repo}`);
  } catch (err) {
    console.error(`[readme] FAILED: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generate };
