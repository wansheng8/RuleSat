# Adblock Filter Aggregator

[![Update Filter Lists](https://github.com/wansheng8/RuleSat/actions/workflows/update-filters.yml/badge.svg)](https://github.com/wansheng8/RuleSat/actions/workflows/update-filters.yml)

多源广告拦截过滤规则聚合引擎。从 **26** 个公开规则源抓取、解析、去重、合并、分类，生成适用于 AdGuard、uBlock Origin、Adblock Plus 及各类 DNS 服务器的过滤规则文件。

## 实时统计

| 指标 | 数值 |
|---|---|
| 唯一规则总数 | **632,821** |
| 规则来源 | 26 |
| 规则类别 | 27 |
| 重复移除 | 575,249 |
| 最后更新 | 2026-07-02 09:55:26 |

## 浏览器插件订阅地址

| 插件 | Raw | CDN |
|---|---|---|
| AdGuard | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard.txt) |
| uBlock Origin | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-ublock.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-ublock.txt) |
| Adblock Plus | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-abp.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-abp.txt) |

## DNS / Hosts 订阅地址

| 工具 | Raw | CDN |
|---|---|---|
| AdGuard Home | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard-home.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard-home.txt) |
| Pi-hole / Hosts | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-hosts.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-hosts.txt) |
| 域名列表 | [订阅](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-domains.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-domains.txt) |

## 所有文件下载

| 文件 (点击下载) | CDN 加速 | 格式 | 说明 |
|---|---|---|---|
| [filter-adguard.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard.txt) | AdGuard | AdGuard 浏览器插件 |
| [filter-adguard-home.txt](https://raw.githubusercontent.com/wansheng8/RuleSat/main/output/filter-adguard-home.txt) | [CDN](https://cdn.jsdelivr.net/gh/wansheng8/RuleSat@main/output/filter-adguard-home.txt) | AdGuard Home | AdGuard Home DNS 过滤 (纯网络规则) |
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
| ads-malware-tracking | 273,457 |
| ads | 229,553 |
| phishing | 145,372 |
| tracking | 141,705 |
| ads-regional | 121,143 |
| privacy | 57,467 |
| malware | 19,581 |
| regional-cn | 13,972 |
| regional-ru | 6,166 |
| annoyances | 4,289 |
| popup | 4,026 |
| social | 3,489 |
| whitelist | 3,235 |
| annoyances-regional | 1,839 |
| script | 1,591 |
| spyware | 690 |
| abuse | 646 |
| document | 641 |
| cookies | 474 |
| mining | 239 |
| removeparam | 215 |
| redirect | 96 |
| match-case | 93 |
| stylesheet | 86 |
| mobile-ads | 41 |
| csp | 39 |
| font | 2 |


## 规则类型分布

| 类型 | 数量 |
|---|---|
| network | 576,007 |
| css | 39,718 |
| third-party | 6,821 |
| popup | 3,270 |
| script | 1,590 |
| all | 1,388 |
| image | 1,208 |
| document | 621 |
| css-extended | 619 |
| generic-hide | 430 |
| xhr | 410 |
| subdocument | 247 |
| removeparam | 214 |
| ping | 61 |
| stylesheet | 49 |
| csp | 38 |
| media | 37 |
| rewrite | 23 |
| important | 17 |
| object | 13 |
| badfilter | 11 |
| redirect | 10 |
| websocket | 7 |
| element-hiding | 4 |
| generic-block | 4 |
| font | 2 |
| replace | 2 |


## 规则来源

- EasyList / EasyPrivacy
- AdGuard Base / Tracking / Social / DNS / Spyware / Mobile / Cookies / Popup / CNAME
- uBlock Origin Badware / Privacy / Resource Abuse
- HaGeZi DNS Pro / Ultimate
- Phishing Army
- NoCoin Miners
- Anti-PopAds
- URLhaus Malware
- EasyList China / Germany / Italy / Dutch
- Anti-AD (Chinese)
- CJX Annoyance List
- ABP Warning Removal
- Ad-Wars / YHosts (Chinese)

## 自动更新

每 **12 小时**通过 GitHub Actions 自动更新本 README 及所有过滤器文件。  
[查看更新历史](https://github.com/wansheng8/RuleSat/commits/main/output)

## License

MIT
