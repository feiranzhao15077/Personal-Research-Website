# Personal Research Website

赵斐然的中文科研主页；以问题、模型、实验、证据与边界组织四个项目。EMvision 是旗舰，QuadControl-Lab 为独立自主系统分支。公开入口为 Research-Portfolio，四个底层源仓库保持私有。

## 安装与本地运行

Node.js 24.20.0（`.node-version`），npm 11；锁定依赖版本。新机器：

```sh
npm ci
npx playwright install chromium webkit
npm run dev
```

浏览器默认矩阵包括本机 Microsoft Edge；运行完整矩阵前须安装 Edge。Firefox 在当前 Windows 主机出现 mozglue side-by-side 启动错误，不能记为通过。在可运行环境安装 `npx playwright install firefox`，设置 `PLAYWRIGHT_FIREFOX=1` 后执行测试。

## 校验与构建

```sh
npm run typecheck
npm run build
npm run validate:links
npm test
npm run test:browser
```

build 顺序为内容/引用/原图与 PDF 哈希校验 → 源码公开性扫描 → Astro SSG → dist 隐私扫描。浏览器覆盖 Chromium、Edge、WebKit，桌面/平板/手机/320px；另对五个内容页面跑 320/360/375/390/430/768/1024/1280/1440 宽度矩阵，检查无 JS、键盘、reduced-motion、查看器及失败恢复。模拟器结果不等于真机 Safari/Android 验收。截图和日志在忽略目录中。

## 内容架构

- `src/content/projects/`：四项目 Markdown，引用证据、图件与材料 ID。
- `src/content/evidence/`：24 个证据条目，数值、单位、条件、状态、边界与公开摘要。
- `src/content/figures/`：13 张原图的 SHA-256、来源、用途及预览衍生记录。
- `src/content/materials/`：研究概览、公开 GitHub 和待完成 CV。
- `src/content/site/profile.yaml`：已批准中文姓名、学校专业和邮箱。
- `src/data/research-map.yaml`：主题演进关系和独立分支。
- `public/evidence/originals/`：保持原始字节的科学图件。
- `public/documents/research-overview.pdf`：已公开两页概览原件。

只在对应证据条目维护数字；更改结论需先复核冻结来源。负结果和撤回解释不得移除。私有 canonical artifact 只保留允许公开的标识，链接指向公开摘要。精选代码不等于完整 n=20 复现包。

## 静态发布配置

Astro 6.4.8 + strict TypeScript + plain CSS，无 SSR、React、GSAP、WebGL、外部字体或第三方脚本。地图/导航/正文零 JS；原生 dialog 仅增强原图链接。

正式 URL 为 `https://zhaofeiran.pages.dev/`，base 为 `/`。Astro 使用 `PUBLIC_SITE_URL` 和 `PUBLIC_BASE_PATH` 统一生成 canonical、Open Graph、sitemap、robots 与站内链接。默认 build 是 noindex 草稿，robots 禁止抓取。初版发布本地预检：

```powershell
$env:PUBLIC_SITE_URL = 'https://zhaofeiran.pages.dev'
$env:PUBLIC_BASE_PATH = '/'
npm run predeploy:initial
npm run dry-run
```

`INITIAL_SITE_RELEASE` 允许最终 CV 缺席，但会拒绝任何 CV 链接或临时 PDF；生产首页隐藏 CV 占位。`FULL_RELEASE` 仍要求本人批准的 CV、固定路径和 hash。`npm run predeploy:initial` 检查类型、内容、隐私、发布模式、生产构建、静态与浏览器测试、站内及外部链接。正式构建生成允许抓取的 robots/sitemap，404 仍 noindex。

当前最终 CV 未完成，因此 `npm run validate:release` 与 `npm run predeploy` 会以 `RELEASE BLOCKER` 失败；草稿构建仍可用，站内保留无链接占位。最终 CV 须放在 `public/documents/cv.pdf`，并仅在 `src/content/materials/cv.yaml` 中设置 `accessStatus: PUBLIC`、`approvalStatus: APPROVED`、`publicUrl: /documents/cv.pdf`、实际 SHA-256 `sourceHash` 与字节数 `sourceSize`。Header、首页 CTA、资料区和 Footer 的 CV 链接统一从该条目生成。

Cloudflare Pages 连接公开源码仓库 `feiranzhao15077/Personal-Research-Website` 的 `main` 分支。构建命令 `npm run build`，输出目录 `dist`，Node 24.20.0；生产环境变量为 `RELEASE_MODE=production`、`RELEASE_TARGET=initial`、`PUBLIC_SITE_URL=https://zhaofeiran.pages.dev`、`PUBLIC_BASE_PATH=/`。不需要 Astro Cloudflare adapter、SSR、Pages Functions 或 Workers。`npm run dry-run` 对当前 `dist/` 进行本地静态服务浏览器预检。

## 安全与资产

npm audit 仍报告 Astro/Sharp/esbuild 告警；当前审核过的静态输出无服务端图片处理、上传、认证中间件、view transitions 或 hydrated islands，不将依赖带入生产服务器。构建仅处理可信本地图件，dev/preview 只绑定本机；若引入新运行时能力或不可信图片，必须重新审计并升级。禁止 `npm audit fix --force`。

13 张科研图的再次公开已获所有者确认；原图与 PDF 保留来源。系统字体没有随站分发；站点无模板图片、外部图标包或技能仓库资产。该授权不自动授予访问者再许可权。dist、node_modules、测试产物、.env 与规划资料不提交。
