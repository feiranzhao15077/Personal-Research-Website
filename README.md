# Personal Research Website

面向导师与科研交流的中文研究作品集静态基础版。四个项目通过研究脉络连接，所有主要数值都从证据 ID 引用，负结果、纠错和来源边界默认可见。

## 本地运行

要求 Node.js 24（见 `.node-version`）。

```bash
npm ci
npm run dev
```

静态构建与校验：

```bash
npm run typecheck
npm run validate:content
npm run validate:public
npm run build
npm run test
npm run test:browser
```

`npm run build` 会先做内容交叉引用与公开内容扫描，再构建静态页，最后扫描 `dist/`。浏览器测试使用 Playwright 的 Chromium 和本机 Edge，包含 320px、393px、1366px、1440px 视口以及无 JavaScript 阅读检查。测试截图保存在 `.screenshots/`，不进入 Git。

## 内容位置

- `src/content/projects/`：四个项目的叙述、分层证据引用、图件与材料引用。
- `src/content/evidence/`：24 个证据条目；每条含协议、不确定性、状态、边界和公开摘要入口。
- `src/content/figures/`：13 张获准公开的原图元数据、SHA-256、尺寸与科学用途。
- `src/content/materials/`：公开 PDF、GitHub 与待确认 CV 的访问状态。
- `src/content/site/profile.yaml`：个人公开资料状态。
- `src/data/research-map.yaml`：三节点电磁研究线与独立自主系统分支。
- `public/evidence/originals/`：从冻结公开源逐字节复制的科研图。
- `public/documents/research-overview.pdf`：公开研究概览 PDF，逐字节复制。

修改数值或状态时，应先更新对应证据条目和冻结来源；页面不另存同一指标。图件不得重绘科学内容。原图可点击打开，Phase 5 不加载动画或客户端脚本。

## 当前发布状态

本仓库是本地草稿。公开姓名、学校表述、CV 版本、电子邮件和正式站点域名未获最终确认，分别以 `PENDING` 或 `TBD` 显式记录。网站没有虚构 `mailto:` 或 CV 链接。默认 canonical 使用 `.invalid` 占位域名，页面包含 `noindex`，`robots.txt` 禁止抓取。

正式发布前需完成内容审批、补齐以上资料、设定真实 `PUBLIC_SITE_URL`，并以 `RELEASE_MODE=production` 运行公开内容检查。当前没有配置 Git remote，也没有部署脚本。

## 技术边界

Astro 6 SSG + 严格 TypeScript + CSS；无 React、GSAP、WebGL、第三方运行时脚本。Research Map 在窄屏变为纵向时间线，四旋翼控制分支保持独立。核心信息在静态 HTML 中，即使 JavaScript 不可用也可阅读。
