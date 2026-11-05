# RadioVerse 集成维护

About 中“格物穷理，致数博学”下方的整体可点击入口进入 `/radioverse/`。入口沿用科研主页的暖白、深蓝、字体与排版；悬停和键盘焦点有箭头反馈，减少动态效果时停用位移动画。主页只加载入口，实验台的 React、Three.js、Worker 和数值计算在独立页面加载。

RadioVerse 源码保留在相邻的 `RadioVerse/` 工程，继续支持独立本地开发。集成版本提供“返回主页”链接，目标为 `/#about`；物理模型、I/Q、STFT、数据导出及其科学边界沿用模块说明。

## 文件与构建

| 路径 | 用途 |
| --- | --- |
| `src/components/RadioVerseEntrance.astro` | 主页轻量入口 |
| `src/pages/index.astro` | About 中的入口位置 |
| `scripts/sync-radioverse.mjs` | 构建独立模块并同步完整静态产物 |
| `public/radioverse/` | 可发布的生成文件，包含 assets、字体和 Worker |
| 相邻 `RadioVerse/src/App.tsx` | 根据 `VITE_RESEARCH_HOME` 显示返回链接 |

在科研网站根目录运行 `npm run sync:radioverse` 可单独同步模块；`npm run build` 会在网站构建前自动执行同步。首次使用或模块依赖更新后，先在 RadioVerse 工程安装依赖。

同步默认寻找相邻的 `RadioVerse/`。源码在其他目录时，用 `RADIOVERSE_SOURCE` 指向其工程根目录，例如：

```powershell
$env:RADIOVERSE_SOURCE = 'E:\不如自成宇宙\RadioVerse'
npm run sync:radioverse
```

模块构建成功后才替换 `public/radioverse/`，且复制整个 `dist/`。不要手动编辑生成文件或单独复制 `index.html`。同步脚本按 `PUBLIC_BASE_PATH` 注入返回 About 的 `VITE_RESEARCH_HOME`；根路径发布时为 `/#about`。独立启动模块时未设置该变量，不显示科研主页返回链接。

未设置 `RADIOVERSE_SOURCE` 且相邻源码不存在时，网站构建可使用已有的 `public/radioverse/index.html` 静态包。更新实验台需要先从源码重新同步；缺少静态包或显式指定的源码不可用时，构建会停止。

## 发布与记录

入口和独立实验台已发布至现有 Cloudflare Pages 网站：[科研主页 About](https://zhaofeiran.pages.dev/#about)、[RadioVerse](https://zhaofeiran.pages.dev/radioverse/)。本次发布地址为 `https://a3255826.zhaofeiran.pages.dev/`；线上已确认三维场景、完成的 STFT 计算和首页入口，记录位于 `.impeccable/review/radioverse-integration/deployment.md`。

本次集成的既有完成评审记录位于 `.impeccable/review/radioverse-integration/finish-review.md`，包含桌面、手机与独立实验台截图。现有 `DESIGN.md` 和 `.impeccable/design.json` 继续作为主页视觉系统来源；此次入口没有新增系统级设计规则。
