# 全站审查报告

日期：2026-10-02  
版本：生产站 zhaofeiran.pages.dev，提交 0b02cc4  
结论：主体功能可用、视觉方向一致。需要优先补齐动画偏好，再整理移动端遮挡、阅读密度和相册方向。

本报告记录问题和修改建议，未修改网站实现。

## 范围与结果

检查了首页、四个项目页、课程基础、个人空间与 404 页面；结合线上浏览器、公开文案和源代码审查。

| 视口宽度 | 实际浏览的页面 |
| --- | --- |
| 1440 | 首页、四个项目、课程基础、个人空间 |
| 1024、768 | 首页、EMvision、个人空间 |
| 390 | 首页、四个项目、课程基础、个人空间、404 |
| 320 | EM-Trace、QuadControl-Lab、个人空间 |

尺寸检查使用桌面 Chromium 的视口模拟。真实手机触摸手势、Safari 渲染和长时间帧率未作实机测量。

| 检查 | 结果 |
| --- | --- |
| Astro 类型检查 | 55 个文件，0 错误、0 警告、1 个未使用参数提示 |
| 静态内部链接与锚点 | 8 个 HTML 路由，无缺失文件或锚点 |
| 公开外链 | 7 个链接全部返回 HTTP 200 |
| 现有 Node 测试 | 3 项通过；1 项脚本体积预算测试失败 |
| 线上控制台 | 本次访问与操作中未捕获错误 |
| 响应式 | 检查的页面与尺寸未出现整页横向溢出 |

## 技术评分

| 维度 | 分数 / 4 | 说明 |
| --- | ---: | --- |
| 可访问性 | 3 | 主要文字对比度、键盘操作和弹窗焦点良好；动画偏好与标题层级有遗漏 |
| 性能 | 3 | 静态页面及缩略图方案合理；首页动画模块偏大，存在提前加载完整照片 |
| 响应式 | 3 | 正文能重排；小屏存在悬浮向导及导航遮挡 |
| 主题一致性 | 4 | 科研阅读页与独立个人空间各自连贯，主要文字足够深 |
| 实现完整性 | 3 | 基本流程完整；预算、测试覆盖与 sitemap 有待同步 |
| 合计 | **16 / 20** | 用于本次内部审查，不等同于全面兼容性认证 |

## 问题清单

### F01 · P1：减少动态效果没有覆盖全部动画

**位置：** [ResearchMap.astro:646](E:/不如自成宇宙/Personal-Research-Website/src/components/ResearchMap.astro:646)、[global.css:318](E:/不如自成宇宙/Personal-Research-Website/src/styles/global.css:318)

研究地图无条件创建 0.8 秒位移淡入和 2 秒画线的 GSAP 动画，未检查 prefers-reduced-motion。CSS 将动画时长压缩为 0.01ms，但没有终止无限循环，也不能停止 GSAP 的 JavaScript 动画。此项由源代码确认，本轮未改变操作系统的动画设置进行复现。

**建议：** 减少动态模式直接呈现完整地图；循环装饰显式关闭动画或限定迭代次数。雷达自动巡航也应提供可发现的暂停入口。保留正常模式下已确认的飞行效果。后续路线：harden / animate。

### F02 · P2：手机向导仍会盖住正文和按钮

**位置：** [reader-guide-safe-space.ts:22](E:/不如自成宇宙/Personal-Research-Website/src/lib/reader-guide-safe-space.ts:22)、[reader-guide.css:91](E:/不如自成宇宙/Personal-Research-Website/src/styles/reader-guide.css:91)

390px 首页中，向导占据 x=12–72、y=670–766；研究入口与 CV 按钮位于同一区域。实际截图中精灵压在两个按钮的左侧。项目页也会覆盖图注附近的内容。自动选位降低了遮挡，但没有保证手机正文完全可读。

**建议：** 小屏将向导停靠到专用控制区，项目页可使用底部返回栏的空位；阅读或滚动时可自动收为小入口。后续路线：adapt / harden。

![手机首页的向导覆盖按钮](E:/不如自成宇宙/Personal-Research-Website/.impeccable/review/site-audit-2026-10-02/guide-mobile-overlap.png)

### F03 · P2：窄屏锚点定位低估了导航高度

**位置：** [global.css:24](E:/不如自成宇宙/Personal-Research-Website/src/styles/global.css:24)、[Header.astro:17](E:/不如自成宇宙/Personal-Research-Website/src/components/Header.astro:17)

全局滚动预留固定为 6rem。320px 时导航换行后高约 170.4px；直接进入 EM-Trace 的 #evidence 时，标题顶端约 165.25px，顶部被导航遮住，章节编号完全被遮。1024px 的导航也增高至约 136px。

**建议：** 滚动偏移使用实际导航高度，或分别定义各断点的预留高度。后续路线：adapt。

![窄屏中被导航覆盖的章节顶部](E:/不如自成宇宙/Personal-Research-Website/.impeccable/review/site-audit-2026-10-02/anchor-320.png)

### F04 · P2：三张证据卡片的双栏末行留白较大

**位置：** [global.css:249](E:/不如自成宇宙/Personal-Research-Website/src/styles/global.css:249)、[project-reading.css:28](E:/不如自成宇宙/Personal-Research-Website/src/styles/project-reading.css:28)

EM-Trace 与 QuadControl-Lab 各有三张主证据卡，双栏末行只有左侧内容。1440px 下 EM-Trace 的最后一张卡约高 397px，右侧同时空出一整列。EMvision 四张、LowAlt-MD 六张的整行排列相对更均衡。

**建议：** 三项内容使用两项并列加一项横向收尾，或采用统一的证据条目排列；保持 DOM 阅读顺序。后续路线：adapt / distill。

### F05 · P2：正文还需要一次面向读者的语言整理

**位置：** [QC-02.yaml:9](E:/不如自成宇宙/Personal-Research-Website/src/content/evidence/QC-02.yaml:9)、[QC-04.yaml:13](E:/不如自成宇宙/Personal-Research-Website/src/content/evidence/QC-04.yaml:13)、[EVM-02.yaml:25](E:/不如自成宇宙/Personal-Research-Website/src/content/evidence/EVM-02.yaml:25)、[项目模板:41](<E:/不如自成宇宙/Personal-Research-Website/src/pages/projects/[slug].astro:41>)

此前“个人分工待核对”“无可作为网站性能结果的 metric”等措辞已修正，但仍有以下阅读负担：

- QC-02 的 A2 数值直接展示 0.3354319429327265；EMvision 的区间也把完整精度和四舍五入值同时放在默认正文。
- “same gyro、specific-force magnitude”“frozen deterministic experiment”等短语缺少中文说明。
- 项目首屏同时展示长版研究介绍和含义相近的摘要；EMvision 又接一组研究速览，信息有重复。
- LOW-06 仍写“负结果保留在研究收获与限制部分”，实际数值已经直接出现在当前证据卡中，表述应与内容位置一致。

**建议：** 中文解释优先，必要标识保留在括号内；默认展示合理精度，完整精度进入审计细节；首屏保留一份清楚的摘要。保留研究条件、负结果和原始数值，不扩大结论。后续路线：clarify / distill。

### F06 · P2：照片 02、04 中的证书横着显示

**位置：** [space.astro:31](E:/不如自成宇宙/Personal-Research-Website/src/pages/space.astro:31)

两张照片的大图已分别核对，证书文字均旋转约 90°，目前查看器没有旋转入口。照片 02 在手机中尤其难读。

**建议：** 给这两张设置展示方向，或给查看器增加旋转功能，保留原始文件。后续路线：polish / harden。

![照片 02 的证书方向](E:/不如自成宇宙/Personal-Research-Website/.impeccable/review/site-audit-2026-10-02/photo-02-mobile.png)

### F07 · P2：脚本预算超标，完整照片加载过早

**位置：** [ResearchMap.astro:640](E:/不如自成宇宙/Personal-Research-Website/src/components/ResearchMap.astro:640)、[space.astro:100](E:/不如自成宇宙/Personal-Research-Website/src/pages/space.astro:100)、[site.test.mjs:72](E:/不如自成宇宙/Personal-Research-Website/tests/site.test.mjs:72)

现有测试统计全站生成脚本及首页内联脚本，共 70,630 字节 gzip，超过 50KiB 预算约 38%。这不是“每一页都下载 70KB”：按依赖统计，首页模块约 59.6KiB，项目页向导约 6.2KiB，个人空间约 33.9KiB，均未计页面内联脚本。

首页研究地图模块含 ScrollTrigger，压缩约 19.7KiB，进入首页就加载。个人空间的隐藏弹窗预先赋了第一张完整照片的 src；线上在未打开照片时已观察到该大图加载完成。

**建议：** 按页面重新明确预算，精简或延迟地图入场动画模块；查看器首次打开时再加载完整图。体积问题不能直接等同于掉帧，本轮没有采集帧率。后续路线：optimize。

### F08 · P2：标题层级存在跳级和重复

**位置：** [ResearchMap.astro:82](E:/不如自成宇宙/Personal-Research-Website/src/components/ResearchMap.astro:82)、[项目模板:64](<E:/不如自成宇宙/Personal-Research-Website/src/pages/projects/[slug].astro:64>)、[emvision.md:73](E:/不如自成宇宙/Personal-Research-Website/src/content/projects/emvision.md:73)

研究地图的四个项目标题从章节 h2 直接跳到 h5。项目“研究收获与限制”下面，Markdown 又输出同级 h2“研究收获”和“证据阅读说明”。视觉上能看懂，但读屏标题导航和文档结构不够清楚。

**建议：** 地图项目使用 h3，项目解释部分使用 h3 子标题，并统一去除重复的章节标题。后续路线：harden / normalize。

### F09 · P3：个人空间的搜索设置不一致

**位置：** [space.astro:43](E:/不如自成宇宙/Personal-Research-Website/src/pages/space.astro:43)、[astro.config.mjs:13](E:/不如自成宇宙/Personal-Research-Website/astro.config.mjs:13)

个人空间设置 noindex,nofollow，但 sitemap-0.xml 仍包含 /space/。这不代表已经被搜索引擎收录，但两项配置意图不一致。

**建议：** 按当前 noindex 方向，把个人空间从 sitemap 排除。后续路线：harden。

### F10 · P3：自动化路由覆盖落后于网站功能

**位置：** [site.test.mjs:14](E:/不如自成宇宙/Personal-Research-Website/tests/site.test.mjs:14)、[release.spec.ts:10](E:/不如自成宇宙/Personal-Research-Website/tests/browser/release.spec.ts:10)

静态路由测试仍列出首页、四个项目与 404；浏览器宽度矩阵仍覆盖五个科研页面。课程页、个人空间、开场会话逻辑与照片异步切换没有对应覆盖，今后的回归容易遗漏。

**建议：** 后续补入这些已新增页面，重点覆盖首次开场、重播、快速切图和关闭后失效的旧图片请求。后续路线：harden。

## 已确认正常的部分

- 麦克斯韦方程中的 D、B、E、H、J 均为带箭头的矢量形式，rho 为标量；数学内容有可读说明。
- 电磁波可用键盘播放和暂停，实际波形会更新；雷达方向键与 Escape 复位正常；歼-16 可触发动作并暂停。
- 科研图可以放大到原始尺寸、滚动查看、Escape 关闭，并把焦点还给原图入口。
- 个人空间首次会话会自动开场，之后进入画廊；重播和跳过有效。连续切图后的标题、图片与文字一致，关闭能恢复焦点。
- 18 张图片均有对应替代文字与配文，科研图继续保留来源和解释边界。
- 主要文字色与科研背景的计算对比度为 7.34:1–13.27:1；个人相册配文约 8.19:1，均高于普通正文 4.5:1 的要求。此项是主要色值核对，不包括图片内文字。
- Impeccable 静态扫描的四条提示经复核未直接当作故障：科研图查看器的空 src 是隐藏动态图片；蓝图网格符合工程示意用途；局部侧线和悬停缓动属于现有视觉选择。

## 功能状态说明

自由问答仍为**界面预览**。线上明确显示“自由问答暂未开放”，发送按钮禁用，当前没有实际发送问题。这是需要接通的后续功能，不应把“配置了密钥”当成“问答已上线”。

## 建议处理顺序

1. 动画偏好、向导遮挡、窄屏锚点：先改善稳定性与可读性。
2. 证据卡排列、文字精度与中文说明、证书方向：完成阅读体验收尾。
3. 脚本体积、隐藏大图加载、标题语义、测试与搜索配置：同步技术维护。

截图、线上文字快照和视口测量保存在本报告所在目录，可在修改时直接复核对应问题。
