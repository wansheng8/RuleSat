# Adblock Filter Aggregator

[![Update Filter Lists](https://github.com/wansheng8/RuleSat/actions/workflows/update-filters.yml/badge.svg)](https://github.com/wansheng8/RuleSat/actions/workflows/update-filters.yml)

多源广告拦截过滤规则聚合引擎。从 **24** 个公开规则源抓取、解析、去重、合并、分类，生成适用于 AdGuard、uBlock Origin、Adblock Plus 及各类 DNS 服务器的过滤规则文件。

## 实时统计

| 指标 | 数值 |
|---|---|
| 唯一规则总数 | **1,146,575** |
| 规则来源 | 24 |
| 规则类别 | 23 |
| 重复移除 | 237,372 |
| 最后更新 | 2026-06-25 15:26:01 |

## 浏览器插件订阅地址

| 插件 | Raw | CDN |
|---|---|---|
| AdGuard | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard.txt) |
| uBlock Origin | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-ublock.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-ublock.txt) |
| Adblock Plus | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-abp.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-abp.txt) |

## Shadowrocket / Surge / Quantumult 订阅

| 工具 | Raw | CDN |
|---|---|---|
| Shadowrocket 完整配置 | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-shadowrocket.conf) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-shadowrocket.conf) |
| Shadowrocket 纯规则 | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-shadowrocket-rules.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-shadowrocket-rules.txt) |

> Shadowrocket 使用方法: 配置 > 规则 > 更新规则列表，填入纯规则链接即可。连接国外节点时自动拦截广告域名。

## DNS / Hosts 订阅地址

| 工具 | Raw | CDN |
|---|---|---|
| AdGuard Home | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard.txt) |
| Pi-hole / Hosts | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-hosts.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-hosts.txt) |
| 域名列表 | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-domains.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-domains.txt) |

## 所有文件下载

| 文件 (点击下载) | CDN 加速 | 格式 | 说明 |
|---|---|---|---|
| [filter-adguard.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard.txt) | AdGuard | AdGuard 浏览器插件 / AdGuard Home |
| [filter-ublock.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-ublock.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-ublock.txt) | uBlock Origin | uBlock Origin 浏览器插件 |
| [filter-abp.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-abp.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-abp.txt) | Adblock Plus | Adblock Plus 浏览器插件 |
| [filter-hosts.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-hosts.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-hosts.txt) | Hosts | Pi-hole / 标准 hosts 文件 |
| [filter-domains.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-domains.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-domains.txt) | 域名列表 | 纯域名列表 (一行一个) |
| [filter-shadowrocket.conf](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-shadowrocket.conf) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-shadowrocket.conf) | Shadowrocket | Shadowrocket 完整配置 (精选3万高危域名) |
| [filter-shadowrocket-rules.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-shadowrocket-rules.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-shadowrocket-rules.txt) | Shadowrocket Rules | Shadowrocket 纯规则 (精选3万高危域名) |
| [filter-dnsmasq.conf.gz](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-dnsmasq.conf.gz) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-dnsmasq.conf.gz) | Dnsmasq (gz) | Dnsmasq DNS 服务器 (gzip) |
| [filter-unbound.conf](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-unbound.conf) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-unbound.conf) | Unbound | Unbound DNS 服务器 |
| [filter-bind-rpz.conf](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-bind-rpz.conf) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-bind-rpz.conf) | BIND RPZ | BIND DNS RPZ 区域文件 |
| [filter-rules.json.gz](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-rules.json.gz) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-rules.json.gz) | JSON (gz) | 完整规则数据 (gzip) |
| [REPORT.md](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/REPORT.md) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/REPORT.md) | 报告 | 统计报告 |


## 规则类别分布

| 类别 | 规则数 |
|---|---|
| ads-malware-tracking | 723,514 |
| ads | 265,172 |
| phishing | 145,427 |
| ads-malware | 82,661 |
| privacy | 63,787 |
| tracking | 63,299 |
| annoyances | 54,389 |
| malware | 22,324 |
| regional-ru | 19,866 |
| ads-regional | 19,649 |
| social | 19,608 |
| cookies | 18,261 |
| regional-cn | 15,022 |
| spam | 8,140 |
| whitelist | 7,102 |
| popup | 3,948 |
| abuse | 1,383 |
| spyware | 690 |
| mining | 593 |
| redirect | 321 |
| stylesheet | 122 |
| mobile-ads | 41 |
| font | 6 |


## 规则类型分布

| 类型 | 数量 |
|---|---|
| network | 1,047,988 |
| css | 79,206 |
| third-party | 7,202 |
| popup | 3,193 |
| script | 2,815 |
| all | 1,384 |
| image | 1,301 |
| css-extended | 817 |
| document | 653 |
| xhr | 608 |
| generic-hide | 389 |
| subdocument | 227 |
| removeparam | 218 |
| badfilter | 181 |
| media | 85 |
| stylesheet | 77 |
| ping | 59 |
| important | 42 |
| csp | 41 |
| redirect | 31 |
| rewrite | 20 |
| object | 13 |
| websocket | 11 |
| element-hiding | 4 |
| font | 4 |
| generic-block | 3 |
| replace | 2 |
| other | 1 |


## 规则来源

- EasyList / EasyPrivacy
- AdGuard Base / Tracking / Social / DNS / Spyware / Mobile / Cookies
- uBlock Origin Badware / Privacy / Resource Abuse / Unbreak
- Fanboy Annoyance / Social
- Peter Lowe's Hosts
- StevenBlack Hosts
- someonewhocares Hosts
- oisd full
- HaGeZi DNS Pro
- Phishing Army
- NoCoin Miners
- Anti-PopAds
- Spam404
- URLhaus Malware
- EasyList China

## 自动更新

每 **12 小时**通过 GitHub Actions 自动更新本 README 及所有过滤器文件。  
[查看更新历史](https://github.com/wansheng8/RuleSat/commits/main/output)

## License

MIT
