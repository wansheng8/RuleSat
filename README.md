# Adblock Filter Aggregator

[![Update Filter Lists](https://github.com/wansheng8/RuleSat/actions/workflows/update-filters.yml/badge.svg)](https://github.com/wansheng8/RuleSat/actions/workflows/update-filters.yml)

多源广告拦截过滤规则聚合引擎。从 **37** 个公开规则源抓取、解析、去重、合并、分类，生成适用于 AdGuard、uBlock Origin、Adblock Plus 及各类 DNS 服务器的过滤规则文件。

## 实时统计

| 指标 | 数值 |
|---|---|
| 唯一规则总数 | **1,106,251** |
| 规则来源 | 37 |
| 规则类别 | 24 |
| 重复移除 | 727,570 |
| 最后更新 | 2026-06-30 09:57:04 |

## 浏览器插件订阅地址

| 插件 | Raw | CDN |
|---|---|---|
| AdGuard | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard.txt) |
| uBlock Origin | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-ublock.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-ublock.txt) |
| Adblock Plus | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-abp.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-abp.txt) |

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
| [filter-dnsmasq.conf.gz](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-dnsmasq.conf.gz) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-dnsmasq.conf.gz) | Dnsmasq (gz) | Dnsmasq DNS 服务器 (gzip) |
| [filter-unbound.conf](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-unbound.conf) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-unbound.conf) | Unbound | Unbound DNS 服务器 |
| [filter-bind-rpz.conf](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-bind-rpz.conf) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-bind-rpz.conf) | BIND RPZ | BIND DNS RPZ 区域文件 |
| [filter-rules.json.gz](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-rules.json.gz) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-rules.json.gz) | JSON (gz) | 完整规则数据 (gzip) |
| [REPORT.md](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/REPORT.md) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/REPORT.md) | 报告 | 统计报告 |


## 规则类别分布

| 类别 | 规则数 |
|---|---|
| ads-malware-tracking | 627,351 |
| ads | 274,895 |
| tracking | 159,141 |
| phishing | 145,652 |
| ads-regional | 127,546 |
| ads-malware | 88,464 |
| privacy | 63,934 |
| annoyances | 57,410 |
| malware | 21,264 |
| social | 19,355 |
| cookies | 18,319 |
| regional-cn | 18,151 |
| regional-ru | 16,103 |
| spam | 8,140 |
| whitelist | 7,569 |
| popup | 4,051 |
| annoyances-regional | 1,840 |
| abuse | 1,380 |
| spyware | 690 |
| mining | 451 |
| redirect | 330 |
| stylesheet | 127 |
| mobile-ads | 41 |
| font | 6 |


## 规则类型分布

| 类型 | 数量 |
|---|---|
| network | 997,567 |
| css | 88,228 |
| third-party | 7,716 |
| popup | 3,296 |
| script | 2,921 |
| all | 1,387 |
| image | 1,344 |
| css-extended | 1,011 |
| xhr | 646 |
| document | 616 |
| generic-hide | 441 |
| subdocument | 266 |
| removeparam | 218 |
| badfilter | 182 |
| media | 92 |
| stylesheet | 78 |
| ping | 61 |
| csp | 43 |
| important | 42 |
| redirect | 32 |
| rewrite | 25 |
| object | 13 |
| websocket | 11 |
| element-hiding | 4 |
| generic-block | 4 |
| font | 4 |
| replace | 2 |
| other | 1 |


## 规则来源

- EasyList / EasyPrivacy
- AdGuard Base / Tracking / Social / DNS / Spyware / Mobile / Cookies / Popup / CNAME
- uBlock Origin Badware / Privacy / Resource Abuse / Unbreak
- Fanboy Annoyance / Social
- Peter Lowe's Hosts
- StevenBlack Hosts
- someonewhocares Hosts
- oisd full
- HaGeZi DNS Pro / Ultimate
- Phishing Army
- NoCoin Miners
- Anti-PopAds
- Spam404
- URLhaus Malware
- EasyList China / Germany / Italy / Dutch
- Dan Pollock Hosts
- AdAway Hosts
- Anti-AD (Chinese)
- CJX Annoyance List
- ABP Warning Removal
- KADhosts
- Ad-Wars / YHosts (Chinese)

## 自动更新

每 **12 小时**通过 GitHub Actions 自动更新本 README 及所有过滤器文件。  
[查看更新历史](https://github.com/wansheng8/RuleSat/commits/main/output)

## License

MIT
