# 建模展柜维护

展柜沿用科研主页的暖白、深蓝和中文衬线标题，以真实 GLB 模型、玻璃柜、圆形转盘和两盏顶部灯作为入口展示。目前展出用户的歼-16、歼-20 V3 鸭翼平放版和 R-04 雷达小车 Blender/Cycles 作品。科研主页 Research Map 右下和个人空间标题旁的两个整体可点击入口进入 `/models/`；该页是略微倾斜的圆环选模页，点选图片和名称进入对应详情。详情靠近真实模型并淡去柜体。个人空间入口固定在浮动照片画廊外。

透明图片用于模型尚未加载或加载失败时的后备画面。各作品的渲染图保留在详情页可展开的“高清细节图”中，可选择视角并打开已有的可访问高清查看器。后续收录真实模型需要标准/lite GLB、照片及真实元数据；尚未提供的其他作品不创建占位条目。

## 文件与来源

| 路径 | 用途 |
| --- | --- |
| `src/content/models/<model-id>.yaml` | 作品元数据；文件名决定详情路由，如 `j16.yaml` → `/models/j16/` |
| `public/models/<model-id>/<model-id>.glb` | 标准网页 GLB，在桌面详情的轻量模型显示后后台加载 |
| `public/models/<model-id>/<model-id>-lite.glb` | 较轻网页 GLB，供详情首帧和 compact/coarse-pointer 设备使用 |
| `public/models/<model-id>/<model-id>-preview.glb` | 入口专用预览 GLB；未配置时回退到 lite |
| `src/assets/models/<model-id>/` | 保留原始高清渲染图和透明后备图，由 Astro 生成网页图像 |
| `.impeccable/model-assets/<model-id>.json` | 准备脚本生成的 GLB 来源、输入/输出 SHA-256、字节数、三角面和扩展记录 |
| `src/assets/models/j16/source.json` | 现有照片包的来源、分辨率及原图 SHA-256 记录 |

来源记录供维护追溯；网页通过 YAML 中的公开资源路径加载。保留用户的原 GLB、PNG 和 Blender 工程，准备脚本只写网页衍生文件。当前 J-16 原 GLB 来自用户提供的 `J16_Web_3D_Pack`，照片来自 `J16_Web_PNG_Pack.zip`。

## 准备网页 GLB

在项目根目录使用通用脚本：

```text
node scripts/prepare-model-glb.mjs <source-pack-directory> <public-output-directory> [model-id] [--preview-only]
```

`model-id` 使用小写字母、数字和连字符；省略时取输出目录的末级名称。源目录需包含 `<model-id>.glb` 和 `<model-id>-lite.glb`，默认输出标准、lite 和 preview 三档，来源记录写入 `.impeccable/model-assets/<model-id>.json`。`--preview-only` 只重建入口预览，保留已有标准/lite 文件及其来源记录。例如，更新 J-16 时将本地来源目录代入：

```sh
node scripts/prepare-model-glb.mjs "<source-pack-directory>" "public/models/j16" j16
```

输入只包含模型，采用 +Y 向上、+Z 为正前方、米单位和轮子接地原点；将柜体、展台或场景灯光留给运行时。运行时按包围盒水平归中，将 X/Z 最大边限制在 2.24 场景单位，同时将模型高度限制在 1.18 场景单位，并把最低点放到转盘上。较高的小车按完整高度缩小，详情的观察中心和取景距离随尺寸调整。新作品需采用相同轴向及合理的轮地位置，避免把无关场景对象计入包围盒。

源文件名和正前方不符合约定时，可使用 `--desktop-file=<原标准文件名>`、`--mobile-file=<原轻量文件名>` 和 `--yaw-degrees=<绕 Y 轴角度>`。脚本仅在网页输出中添加朝向根节点，原文件不变。每档来源记录保留原始文件名、原始 SHA-256 和旋转角度。歼-20源包位于旧 `J16_Web_3D_Pack` 目录，其中 `j20.glb` 和名为 `j16-lite.glb` 的文件均为歼-20 V3；接入时分别输出 `j20.glb` / `j20-lite.glb`，用 `--yaw-degrees=90` 将 -X 机头转为 +Z。现有歼-16作品与资源独立保留。

标准和 lite 衍生文件以 WebP quality 92 压缩颜色纹理、lossless WebP 保存法线，使用 Meshopt medium、16-bit position/UV 和 12-bit normals；保留 PBR transmission、clearcoat、IOR，不追加减面。每个输出文件有 25 MiB 大小检查。

preview 从源 lite 单独生成，使用 Meshopt 简化（ratio 0.16、error 0.004）、768px 颜色纹理（WebP quality 86）、512px 无损非颜色纹理，以及 14-bit position/UV、10-bit normals。减面和缩小纹理仅用于入口预览，不覆盖原工程或标准/lite 文件。

新增作品的网页衍生资源如下；两档标准/lite 均保留来源三角面数，静态模型未添加部件动画：

| 资源 | 网页文件大小 | 三角面 |
| --- | --- | --- |
| 歼-20 标准 / lite / preview | 3.40 / 1.50 / 0.50 MiB | 197,877 / 97,401 / 20,185 |
| 雷达小车 标准 / lite / preview | 7.13 / 1.20 / 1.03 MiB | 600,994 / 68,962 / 49,595 |
| SAR 卫星 标准 / lite / preview | 2.36 / 1.77 / 1.58 MiB | 254,428 / 150,137 / 137,599 |
| RQ-4 全球鹰 标准 / lite / preview | 1.73 / 1.07 / 0.85 MiB | 277,314 / 126,604 / 89,001 |
| QX-450 四旋翼 标准 / lite / preview | 3.58 / 1.62 / 0.80 MiB | 366,070 / 119,944 / 77,901 |

RQ-4 和 QX-450 为第五、第六件作品。采用用户原动画 GLB，各自保留 `RQ4_Demonstration`、`360_Turntable_and_Exploded_Assembly`，未保存或改写原工程。来源只含一档 GLB，手机分别通过 `--mobile-ratio=0.30`、`0.25` 简化网页衍生几何；部件层级、关键帧、材质仍保留。QX 重复 UV 超出 [0,1]，准备工具自动跳过其 UV 量化，保留原纹理坐标。

两款的旋转与拆解位于同一条源片段，YAML 使用相同 `orbit`/`assembly` 名及可选 `orbitDuration`（RQ-4为8秒，QX为6秒）。运行时只在该组合配置中独立绑定旋转 quaternion 轨道和装配平移轨道，避免同一轨道被两个动作混合；不修改原 GLB 动画。RQ-4拆解区间约8.033–10.033秒，QX为6.667–9.333秒，展开后保持，组装反向采样该区间。源根节点的平移仍属于拆解动作。现有 SAR 的独立两片段逻辑保持。

透明封面从原 Blender 模型单独渲染（隐藏摄影棚几何、保留灯光、透明背景、不保存工程）。RQ-4保留八张来源图，包括五张展示/特写和三张正交图；QX保留五张来源图。内部航电与 SAR 阵列是用户说明中的展示示意结构；本页不添加任务或飞行性能数字。

SAR 卫星为第四件作品，源文件 `SAR_Satellite_Web.glb` 内含 `Orbit_360` 和 `Exploded_Assembly` 标准节点动画。`--desktop-file=SAR_Satellite_Web.glb --mobile-file=SAR_Satellite_Web.glb --mobile-ratio=0.35` 从同一源生成网页两档，手机仅简化几何，保留部件层级和两段动画。`mobile-ratio` 默认为1，不影响已有静态作品。SAR 模型和源工程不覆盖。

YAML 的可选 `model3d.animation` 配置 `orbit`、`assembly`、`assemblyStart: 1`、`assemblyEnd: 3.5`。运行时保留 GLTF 动画，展示缩放置于外层 Group；顶部“分解／组装”按钮平滑采样原片段的分解区间，展开后保持，反向采样完成组装。旋转使用原 `Orbit_360` 片段，速度放慢至四分之一。复位恢复装配姿态与角度；减少动态效果时直接切换姿态；模型不可见或页面后台时暂停帧循环。分解包围盒独立测量用于自动取景，分解时隐藏展盘避免遮挡内部零件。

SAR 的透明封面从用户源 Blender 场景另行渲染（隐藏地球和星场、透明背景、不保存工程）；四张高清图为包内原 PNG。来源与生成方式记录在内部 `sar-satellite-images.json`。地球主展示图所用 NASA 纹理来源保留在内部源 README；本机路径不加入公开资源。

雷达小车源完整版为 26.89 MiB，网页压缩后低于 25 MiB 输出上限。模型来源记录分别为 `.impeccable/model-assets/j20.json`、`radar-car.json`。图片保留来源 PNG，不修改像素；`.impeccable/model-assets/<id>-images.json` 记录包哈希、图片哈希、尺寸及出处，`<id>-source-README.md` 保留源说明。本机路径只存在于这些内部维护记录，未放入网页源资产目录。歼-20封面使用包内透明重新导入预览，五张细节图为 1600×1000 的 V3 原渲染；雷达小车使用透明封面及四张 3840×2160 细节图。

当前来源记录为：

| J-16 资源 | 原文件 | 网页衍生 | 保留三角面 |
| --- | --- | --- | --- |
| 标准 `j16.glb` | 32.58 MiB | 9.53 MiB | 643,309 |
| lite `j16-lite.glb` | 10.20 MiB | 3.62 MiB | 215,778 |
| preview `j16-preview.glb` | 10.20 MiB（源 lite） | 2.04 MiB | 53,752 |

标准和 lite 两档各有 32 个网格、32 个材料和 32 张内嵌纹理。文件和材料处理的实际记录以 `.impeccable/model-assets/j16.json` 为准。

## YAML 字段

以 [j16.yaml](../src/content/models/j16.yaml) 为范例。图片路径**相对该 YAML 文件所在目录**解析；GLB 使用从 `/models/` 开始的公开 URL，与 `public/models/` 文件对应：

```yaml
model3d:
  desktop: /models/j16/j16.glb
  mobile: /models/j16/j16-lite.glb
  preview: /models/j16/j16-preview.glb
cover: ../../assets/models/j16/J16_Web_01_Hero_B_Transparent.png
spaceCover: ../../assets/models/j16/J16_Web_03_TopQuarter_B_Transparent.png
```

| 字段 | 填写规则 |
| --- | --- |
| `title` | 中文作品名，如 `歼-16` |
| `designation` | 展示用型号，如 `J-16` |
| `summary` | 一句真实的作品介绍 |
| `software`、`renderer` | 实际建模软件和渲染器 |
| `resolution` | 原图分辨率说明，如 `3840 × 2160` |
| `order` | 非负整数，越小越靠前；建议各作品不同，明确首件作品 |
| `model3d.desktop` | 桌面详情后台补齐的标准 GLB URL，如 `/models/j16/j16.glb` |
| `model3d.mobile` | 详情首帧和手机使用的 lite GLB URL，如 `/models/j16/j16-lite.glb` |
| `model3d.preview` | 可选的入口专用 GLB URL；省略时入口使用 lite |
| `cover` | schema 保留的透明主视角素材字段；当前三维模板使用 `spaceCover` 作后备图 |
| `spaceCover` | 圆环选模缩略图，以及两个入口和详情的透明后备海报；主体尽量居中、能看清完整模型 |
| `views` | “高清细节图”的照片数组，按展示顺序排列，至少一项 |

`model3d` 在 schema 中可选，缺失时显示“先看看高清图”的提示；新增完整三维作品应填写两档真实 GLB 路径。`cover` 和 `spaceCover` 仍是必填图像字段，并保留真实透明通道。后备图无需模拟柜体或固定旧展台构图，柜体与转盘由三维运行时绘制。

每个 `views` 条目包含：

| 字段 | 填写规则 |
| --- | --- |
| `id` | 作品内唯一的视角标识，仅用小写字母、数字和连字符；用于页面锚点 |
| `label` | 缩略图及主图下方显示的短名称 |
| `caption` | 主图下方的简短说明 |
| `alt` | 准确描述视角与可见细节，供读屏使用 |
| `image` | 该视角原始渲染图的相对路径 |

所有文本字段均需非空。字段约束以 [src/content.config.ts](../src/content.config.ts) 中的 `models` schema 为准。

## 照片和自动扩展

`views` 的第一项是展开照片区后的默认视角，建议使用全景；后续项保留完整图像。当前顺序为前侧全景、侧面轮廓、后上方视角、机鼻与座舱、尾部与喷口。缩略图、前后按钮和照片区的键盘方向键遵循数组顺序；点击当前照片可打开高清查看器。

Astro 从 PNG 原图生成响应式 WebP、缩略图及完整尺寸的高清 WebP；高清文件在打开大图时加载。原 PNG 保留，衍生图片无需手动放入 `public/`。当前首张照片使用原有全景构图，其他视角完整适配；新增照片时保持实际视角和读屏描述准确。

新增真实作品时，准备 GLB 衍生文件和原图，在 `src/content/models/` 添加 YAML。圆环选模页和 `getStaticPaths()` 自动读取 collection，生成 `/models/<model-id>/`，无需新增页面模板。`order` 最小的作品同时出现在两个入口；圆环也按 `order` 依次填入作品。公开的名称、简介、建模/渲染信息和视角说明需保持真实。

## 圆环选模维护

`src/pages/models/index.astro` 按真实作品数量均分一个圆环，当前七个扇形显示 `spaceCover` 图片和 `title`。没有空扇形、分组或分页；每个作品入口都是原生链接，脚本未执行时也可进入详情。

圆环使用 SVG 环形几何与 CSS `perspective`／`rotateX(26deg)`，底面下移 10 个 SVG 单位提供薄厚度。选模页只加载 Astro 生成的 640px WebP，不加载 GLB；进入对应详情后才启动真实三维模型。名称超过七个字符时视觉缩略，链接的可访问名称保留完整作品名。

桌面悬停轻微放大图片，键盘聚焦显示扇形边界，并保留导读提示。手机用较大的相对字号，不自动旋转；减少动态偏好关闭放大位移。相关样式集中在 `src/styles/model-selector.css`，共享布局的 `selector` 参数取消当前页的重复导航链接。

## 交互和运行时维护

`ModelStage.astro` 供入口和详情使用，仍保留 cabinet 模式供维护复用；圆环选模页不包含该组件。`src/lib/model-stage.ts` 在距离视口 700px 内载入 Three.js 运行时，`src/lib/model-stage-runtime.ts` 负责实际几何、GLB、灯光和 OrbitControls。两个入口的说明统一为较大的“个人建模作品”。入口使用 `model3d.preview`（未配置时回退到 lite）；详情先使用 `model3d.mobile`。非 compact 桌面详情在轻量模型显示后后台加载 `model3d.desktop`，预编译后替换，保留相机角度和转盘状态；Save-Data 或 2g 连接不补载标准版。compact 定义为宽度 ≤700px 或粗指针。

加载时先显示透明预览图，直到真实模型已编译并绘制首帧才淡出，避免等待中的空柜。高清模型失败时继续保留轻量模型。

入口的桌面悬停或键盘聚焦渐亮两盏灯并停下慢转，离开恢复；手机灯光保持点亮。详情支持拖动环绕、滚轮/双指缩放、右键平移、前侧/俯视/尾部/复位和转盘开关。五个功能按钮位于顶部返回按钮右侧，统一使用深蓝圆角样式；手机保持同一行，可横向滑动按钮区。详情下方不再显示操作说明和重复工具栏。`ModelStageControls.astro` 通过 `data-stage-controls-for` 与舞台 ID 关联，运行时在对应控件组绑定动作；加载完成前按钮禁用。画布聚焦后方向键环绕、+/- 缩放、Home 复位。用户拖动或键盘观察会停转；详情默认停转。详情的约 1.4 秒靠近动画隐藏玻璃柜和方底座，仅留下飞机与圆转盘。减少动态偏好跳过靠近动画和自动旋转。

当前运行时在离屏或标签页隐藏时暂停，使用透明 WebGL 画布。DPR 上限为 compact 1.25、桌面 1.65；入口/compact 最高 30fps，交互桌面最高 60fps；阴影图入口/compact 512px、交互桌面 1024px。两盏灯均参与照明，所有设备仅一盏投射阴影；阴影图仅在模型安装或转盘转动时更新。飞机不接收自身阴影，保留投向转盘的接触阴影；相机和阴影深度范围收紧，减少黑点闪烁。柜体薄玻璃使用透明反射材质，避免五块玻璃分别重绘全场景的折射开销；源模型座舱的 PBR 透明材质保留。整柜取景使用包含底座的八角点透视拟合；改柜体尺寸时同步边界，保留完整首屏及底座边距。

模型失败时保留透明后备图及状态说明，交互模式提供“重新加载模型”；不支持 WebGL 时仍可阅读详情照片。图片后备处理和照片查看器均在现有模板中。

## 本地构建与发布

在项目根目录执行 `npm run dev` 预览，`npm run build` 生成 `dist/`。项目构建脚本先生成阅读向导知识，再执行既有内容、公开性和构建流程。

此前真实三维展柜已完成类型检查（零 errors/warnings/hints）、clean `.scratch/release-check` 镜像构建及公开内容扫描，detector 记录为 `[]`。该次证据位于 `.impeccable/review/model-cabinet-3d/`，包括 11 张桌面／手机入口、列表、详情、点灯／轨道观察及照片查看器截图，以及 `finish-review.md`。该次 fresh reviewer 的最终裁决为 `ship`，整柜／底座边距和个人空间导读遮挡标题两项已标为 resolved。旧 `.impeccable/review/model-cabinet/` 仅记录已被拒绝的图片展台版本。

本次入口文字、加载和渲染优化另完成零诊断类型检查、clean 镜像构建及公开内容扫描，并仅预览入口加载、完成首帧、桌面详情高清补载/拖动及手机入口。记录位于 `.impeccable/review/model-cabinet-optimization/`，没有重复全站审核或 fresh reviewer 流程。

后续圆环选模页完成零诊断类型检查、clean 镜像构建及公开内容扫描，机械 detector 为 `[]`。电脑、聚焦状态和手机截图保存在 `.impeccable/review/model-selector/`，实际点选进入详情与返回已记录；该页 fresh reviewer 结论为 `ship`，无待修复项。维护说明已由当前对话直接同步，未重复全站检查。

当前展柜已部署到 `https://zhaofeiran.pages.dev/models/`，本地镜像预览为 `http://127.0.0.1:4326/models/`。发布沿用 Cloudflare Pages：构建命令 `npm run build`，输出目录 `dist`，`PUBLIC_SITE_URL=https://zhaofeiran.pages.dev`，`PUBLIC_BASE_PATH=/`，完整生产模式为 `RELEASE_MODE=production`、`RELEASE_TARGET=full`。普通构建仍是草稿模式；正式发布遵循 [README.md](../README.md) 的已有约定，并在用户明确要求部署后执行。
# F-22 与七件作品发布（2026-10-05）

F-22 来源为 `E:/blender建模/F22_Raptor`，后机身修订版本 4。原始 `.blend` 与 GLB 未修改；标准、手机、入口 GLB 分别为 1.89、1.28、1.07 MiB，标准版保留 251,460 三角面。独立透明封面使用原始 Hero 镜头重新构图，Cycles CPU 32 samples。

`animation.orbitNode` 指定组合动画中的根转盘节点，避免把弹舱、起落架、喷口的关节旋转误归为整机旋转。`assemblyLabel` / `assemblyReturnLabel` 命名弹舱开合，`assemblyView: underside` 显示底部。可选 `motion` 定义完整起飞时间段；播放与转盘、弹舱互斥，完成后回到初始姿态。减少动态效果时显示静态起飞姿态。

当日早期版本曾采用两组 4 / 3 的六位置圆环，已被下文的单页、无空位方案替代。手机控制按钮换行，无须横向寻找。正常观察允许绕到模型底部，鼠标悬停不再暂停详情的主动旋转。

默认镜头按一次性收集的有限轮廓点拟合，分解与起飞使用完整运动包围范围。高清模型预编译阶段不改动正在显示的轻量模型镜头，后台升级保持当前操作。

## 单页圆环 — 2026-10-05
七个模型全部出现在同一个圆环中，取消分组与分页。此修订最初仍保留第八个空扇区，已被下一节的无空位方案替代。模型详情返回直接进入此总览，入口来源记忆保留。

## 无空位与加载优化 — 2026-10-05
按当前作品数量均分圆环，不再保留空扇区。装饰入口在进入视野附近后等待 160ms，再利用浏览器空闲时间初始化；快速滚过会取消等待。详情页仍优先初始化，交互及模型动画保留。入口渲染单独降低分辨率、环境贴图及手机阴影预算，不改变详情页预算。

## 一屏详情 — 2026-10-05
详情页使用 `100dvh`，顶部功能键与紧凑标题之外的高度全部用于模型观察；取消详情页底部和向下展开的照片区域。加载预览图在观察区完整居中，以 `object-fit: contain` 保留全图，并优先加载。

顶部“细节图”在同一屏切换高清图片，按钮改为“查看模型”用于切回三维模型；模型镜头保留，离屏渲染按既有逻辑暂停。保留视角缩略图、前后切换、说明及原有高清放大查看器，不再要求向下滚动。照片区域设置 `min-width: 0` 防止缩略图撑宽手机页面，手机底部预留阅读向导底栏。低高度窗口减少次要说明，缩略图切为文字选择。

## 最终审核收尾 — 2026-10-06

顶部“细节图”先输出指向第一个完整高清渲染图的原生链接，增强脚本就绪后才设置按钮语义并接管同屏切换。脚本未执行时仍能直接看图；增强后支持 Enter、Space、Escape，并保留 Ctrl/Command 等修饰点击打开原生链接的行为。七个模型均由同一模板生成，不增加详情页向下滚动区域。

静态回归对所有模型详情检查原生入口及对应高清文件，并将选模页和详情纳入站内资源及脚本预算。所有路由初始脚本 gzip 小于 50 KiB；包含按需三维依赖的首页、个人空间和详情总预算小于 250 KiB，其他页面仍小于 50 KiB。HTML modulepreload 计入初始依赖，三维运行时必须延迟加载。此预算是模块独立 gzip 之和，不是网络测速结果。收尾证据见 `.impeccable/review/final-site-finish/`。
