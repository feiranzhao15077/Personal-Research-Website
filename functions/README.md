# 阅读向导问答

`api/guide.ts` 是 Cloudflare Pages Function；仅 `/api/guide` 调用服务端，科研页面继续静态输出。

- 在 Pages 的生产和预览环境配置 Secret `DEEPSEEK_API_KEY`。密钥不得写进网页、仓库或日志。
- 默认模型为 `deepseek-flash`；可通过服务端变量 `DEEPSEEK_MODEL` 调整。
- `npm run build` 会从网站当前公开资料生成 `_data/guide-knowledge.json`。直接执行 `build:astro` 前，先执行 `node scripts/generate-guide-knowledge.mjs`。
- 发布时从项目根目录执行 Pages 发布流程，包含 `functions/` 与 `dist/`；仅上传静态 `dist/` 不会提供问答接口。
- 本地预览使用忽略的 `.dev.vars` 配置密钥，执行 `npx wrangler pages dev dist --port 4326 --compatibility-date 2026-10-01`。普通 Astro 预览仅提供静态页面。

问题限制为 400 字，对话只在当前页面内存保留，服务端最多接受最近六条消息。客户端支持停止等待、失败重试和新对话。请求超时为 30 秒，回答以纯文本呈现，来源链接由服务端生成。

当前包含同源检查、请求长度限制与进程内突发频率限制；后者是单个隔离实例的保护，不是持久或全局用量配额。长期公开运行的配额应由 Cloudflare 的流量规则控制。
