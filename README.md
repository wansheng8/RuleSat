# Adblock Filter Aggregator

多源广告拦截过滤规则聚合引擎。从 30 个公开规则源抓取、解析、去重、合并、分类，生成适用于 AdGuard、uBlock Origin、Adblock Plus 及各类 DNS 服务器的过滤规则文件。

## 自动更新

每 **12 小时**通过 GitHub Actions 自动更新。所有过滤器文件可直接作为订阅地址使用。

## 浏览器插件订阅地址

| 插件 | 订阅地址 |
|---|---|
| AdGuard | `https://raw.githubusercontent.com/{USER}/{REPO}/main/output/filter-adguard.txt` |
| uBlock Origin | `https://raw.githubusercontent.com/{USER}/{REPO}/main/output/filter-ublock.txt` |
| Adblock Plus | `https://raw.githubusercontent.com/{USER}/{REPO}/main/output/filter-abp.txt` |

## DNS / Hosts 订阅地址

| 工具 | 订阅地址 |
|---|---|
| AdGuard Home | `https://raw.githubusercontent.com/{USER}/{REPO}/main/output/filter-adguard.txt` |
| Pi-hole / Hosts | `https://raw.githubusercontent.com/{USER}/{REPO}/main/output/filter-hosts.txt` |
| 域名列表 | `https://raw.githubusercontent.com/{USER}/{REPO}/main/output/filter-domains.txt` |

## 部署到 GitHub

1. Fork 或创建仓库
2. 在 Settings > Pages 中设置 Source 为 "Deploy from a branch"，Branch 选 `main`，Folder 选 `/docs`
3. 在 Settings > Actions > General 中确保 Workflow permissions 选择 "Read and write permissions"
4. GitHub Actions 将每 12 小时自动运行更新

## 本地运行

```bash
# 完整流程
node src/cli.js all

# 仅抓取
node src/cli.js fetch

# 运行测试
npm test
```

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

## 输出格式

| 文件 | 格式 | 大小 | 用途 |
|---|---|---|---|
| filter-adguard.txt | AdGuard | ~28MB | AdGuard 系列 |
| filter-ublock.txt | uBlock Origin | ~28MB | uBlock Origin |
| filter-abp.txt | Adblock Plus | ~28MB | Adblock Plus |
| filter-hosts.txt | Hosts | ~29MB | Pi-hole / hosts |
| filter-dnsmasq.conf | Dnsmasq | ~101MB | Dnsmasq DNS |
| filter-unbound.conf | Unbound | ~51MB | Unbound DNS |
| filter-bind-rpz.conf | BIND RPZ | ~60MB | BIND DNS |
| filter-domains.txt | 域名列表 | ~21MB | 通用 |
| filter-rules.json | JSON | ~129MB | 程序化使用 |

## License

MIT
