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

生产 URL 用两个变量定义，禁止在页面硬编码仓库路径：

| 目标 | PUBLIC_SITE_URL | PUBLIC_BASE_PATH |
|---|---|---|
| GitHub 用户站 | https://feiranzhao15077.github.io | / |
| GitHub 项目站 | https://feiranzhao15077.github.io | /personal-research-website/ |
| 后续自定义域名 | 经批准的 HTTPS origin | / |

默认 build 为 noindex 草稿，robots 禁止抓取。正式发布前补齐批准的 CV PDF、确认 origin，使用以下 PowerShell 命令（这些命令只构建，不部署）：

```powershell
$env:PUBLIC_SITE_URL = 'https://feiranzhao15077.github.io'
$env:PUBLIC_BASE_PATH = '/'
npm run build:release
```

`build:release` 设置生产模式，身份/邮箱/CV/URL 未批准则失败；构建后扫描私有链接、占位信息，核对所有内部链接和锚点，并匿名检查外部材料。正式构建生成允许抓取的 robots/sitemap，自定义 404 仍 noindex。最终 CV 在 Phase 7B 接入普通“打开 CV”与“下载 CV”链接，无内嵌 PDF viewer。

当前最终 CV 未完成，因此发布门禁应失败；站内保留无链接占位。未配置远端或部署工作流。下一阶段才配置受保护的 GitHub Actions 静态发布，具体平台规则在部署时复核。

## 安全与资产

npm audit 仍报告 Astro/Sharp/esbuild 告警；当前审核过的静态输出无服务端图片处理、上传、认证中间件、view transitions 或 hydrated islands，不将依赖带入生产服务器。构建仅处理可信本地图件，dev/preview 只绑定本机；若引入新运行时能力或不可信图片，必须重新审计并升级。禁止 `npm audit fix --force`。

13 张科研图的再次公开已获所有者确认；原图与 PDF 保留来源。系统字体没有随站分发；站点无模板图片、外部图标包或技能仓库资产。该授权不自动授予访问者再许可权。dist、node_modules、测试产物、.env 与规划资料不提交。
