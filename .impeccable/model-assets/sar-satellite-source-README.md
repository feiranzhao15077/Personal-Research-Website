# EO-01 合成孔径雷达卫星展示模型

依据提供的 SAR 卫星参考图及文字要求制作，用于雷达实验室、微波遥感研究及科研作品集展示。EO-01 是本展示模型的名称。

## 交付文件

| 文件 | 用途 |
|---|---|
| `SAR_Satellite_Delivery.zip` | 完整交付包，包含模型、展示图、网页和复现脚本 |
| `SAR_Satellite.blend` | Blender 5.2 原始工程，独立部件、可编辑网格、材质、灯光、相机和动画 |
| `SAR_Satellite_Exploded.blend` | 停在完全分解状态的工程，方便查看内部设备和天线桁架 |
| `SAR_Satellite_Web.glb` | 网站模型，已合并重复几何并嵌入贴图；保留部件层级及两段动画 |
| `index.html` | 本地网页展示，支持旋转、装配分解、分解滑杆及阵面/平台特写 |
| `renders/SAR_Hero.png` | 2048 × 1440，地球地平线背景主展示图 |
| `renders/SAR_Radar_Detail.png` | 1600 × 1200，阵面及展开关节特写 |
| `renders/SAR_Bus_Detail.png` | 1600 × 1400，平台及姿态控制设备特写 |
| `renders/SAR_Exploded.png` | 1800 × 1600，分解结构展示图 |
| `renders/SAR_Web_Preview.png` | 网页实际展示截图 |
| `Model_Report.json` | 实际尺寸、部件数、三角面数与导出统计 |
| `GLB_Validation.json` | Khronos glTF Validator 的验证结果 |
| `Reference_Blueprint.png` / `Original_Brief.txt` | 所提供的参考图与原始需求副本 |

## 尺寸与构型

使用米制，Blender 1 单位 = 1 米。X 轴沿太阳翼，-Y 方向为雷达展开侧，Z 轴朝上。

| 项目 | 尺寸 |
|---|---|
| 整体展开跨度（包含翼尖传感器） | 12.5 m |
| 太阳翼框架外缘跨度 | 12.0 m |
| 主体结构甲板外缘 | 3.0 × 2.0 × 2.2 m |
| SAR 天线框 | 9.0 × 1.5 m |
| 整体高度 | 3.2 m |
| 含阵面的整体深度 | 约 4.40 m |

太阳翼跨度和深灰色阵面按文字需求设定，构型、双翼布局、隔热外壳和部署机构参考所提供图片。天线由 6 段叶片、54 个阵面模块构成；双翼包含共 480 个太阳电池片。阵面表面图案是展示用的微波孔径细节，未指定工作频段、扫描能力或成像性能。

## 部件层级

```text
SAR_Satellite
├── Satellite_Bus
│   ├── Bus_Structure
│   └── Battery_Module
├── SAR_Antenna
│   ├── SAR_Antenna_Panel
│   ├── Support_Truss
│   ├── SAR_Payload_Module
│   └── Antenna_Deployment_Mechanism
├── Solar_Array
│   ├── Solar_Array_Left
│   └── Solar_Array_Right
├── Attitude_Control
│   ├── Attitude_Control_System
│   └── Reaction_Wheel_Module
├── Propulsion_System
│   └── Thruster_Module
└── Communication_System
    └── Communication_Antenna
```

主体包含物理起伏的金色/银色隔热层、甲板和长桁、服务舱盖、光学太阳反射器散热板、接插件和线缆。机电部件含折叠铰链、阵面三角桁架、展开臂、线性执行器、反作用轮、星敏感器、太阳敏感器、抛物面通信天线、低增益天线、推进剂储罐和开口喷管。

## 动画与相机

| 动画名称 | Blender 帧区间（24 fps） | GLB 时长 |
|---|---|---|
| `Orbit_360` | 1–241 | 10 秒，完整一周，可循环 |
| `Exploded_Assembly` | 301–493 | 8 秒，分解、保持、重新装配，可循环 |

第 397 帧为完全分解状态。内部电池、反作用轮和推进剂储罐在整体状态下位于主体内部，分解时才清楚显露。分解动画用于装配展示；天线和太阳翼铰链有实体几何，未制作完整折叠入舱动画。

Blender 中的 `Camera_Hero`、`Camera_Exploded`、`Camera_Radar_Detail`、`Camera_Bus_Detail` 已设好展示镜头；另有 `Camera_Front`、`Camera_Top`、`Camera_Side` 正交视图。打开工程后可从时间轴标记或 NLA 编辑器查看动画。

## 本地网页预览

在本文件夹运行：

```powershell
python preview_server.py
```

打开 <http://127.0.0.1:8775/>。网页依赖已放在 `vendor/`，可离线加载，无需 npm 安装。拖动模型旋转、滚轮缩放；使用按钮选择展示动画，滑杆可停在任意分解程度。支持明暗主题及减少动态效果的系统偏好。

网页部署只需复制 `index.html`、`exhibition.css`、`exhibition.js`、`SAR_Satellite_Web.glb`、`vendor/`、`renders/SAR_Hero.png` 和此说明。模型应通过 HTTP/HTTPS 加载；直接双击 HTML 时浏览器可能阻止本地 GLB 请求。

## 网站与模型使用

GLB 采用标准 PBR 材质和 +Y 朝上的 glTF 坐标约定，含两段标准节点动画。网站版本将独立零件合并为 13 个网格，保留 12 个可分解模块；通信反射器云台单独保留层级。几何约 25.4 万三角面，文件约 12 MB，适合桌面展览浏览；移动设备可根据网站性能预算另做 LOD。

金属隔热毯的宏观褶皱使用实体几何，网站版仍保留；Blender 的程序化微观凹凸不会全部写入 GLB。太阳电池金属栅线和阵面表面使用 UV 贴图。地球、星场、展览灯光、相机和参考图仅属于 Blender 场景，不包含在卫星 GLB 中。

模型是视觉展示概念，未经过射频、电磁、结构、热控或轨道仿真；不应据此推断真实卫星的任务性能或制造方案。

## 复现

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python build_satellite.py
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background SAR_Satellite.blend --python export_web.py
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background SAR_Satellite.blend --python render_presentation.py
```

`build_satellite.py` 可重建完整工程，运行前应保留手动修改的工程副本。构建脚本使用既有的 `textures/NASA_BlueMarble.jpg`，其余主要贴图由脚本生成。源文件保留制造倒角及加权法线修改器。

## 素材说明

地球纹理：NASA Earth Observatory，Blue Marble: Next Generation with Topography and Bathymetry（January 2004）。[NASA 原始资料](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/)。该纹理用于缩放的展览场景，地球与卫星之间的比例和距离不代表实际轨道。

网页组件：Google `<model-viewer>` 4.3.1，Apache License 2.0，许可见 `vendor/model-viewer-LICENSE.txt`。未使用第三方卫星模型。
