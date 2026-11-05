# QX-450 科研四旋翼无人机

按提供的参考图与设计说明，在 Blender MCP 中建立的原创模块化模型。用于个人科研网站、机器人研究展示和装配动画。

## 文件

| 文件 | 用途 |
| --- | --- |
| QX450_Research_UAV.blend | 完整可编辑模型、材质、摄影棚、8 个相机和关键帧动画 |
| QX450_Web.glb | 网站用装配状态模型，细件按模块合并 |
| QX450_Web_Animated.glb | 网站用动画模型，包含转台与拆解序列 |
| QX450_Hero.png | 1600 × 1200 成品渲染 |
| QX450_Exploded.png | 1600 × 1200 分层拆解渲染 |
| QX450_Motor_Detail.png | 电机、铜绕组与弯曲桨叶特写 |
| QX450_Gimbal_Detail.png | 云台相机与减振结构特写 |
| QX450_Electronics_Detail.png | 飞控、AI 模块、电调和配电板特写 |
| QX450_Turntable_360.mp4 | 960 × 720、30 fps、约 6 秒的 360° 转台视频 |
| QX450_Exploded_Assembly.mp4 | 960 × 720、30 fps、约 6.7 秒的拆解及复装视频 |
| Reference_Blueprint.png / Design_Brief.txt | 建模输入资料 |

## 尺寸与坐标

模型以米为实际 Blender 单位，界面采用公制；前方为 -Y，Z 轴向上。

| 项目 | 尺寸 |
| --- | --- |
| 对角电机中心距 | 450 mm |
| 四个电机中心构成的方形跨度 | 约 318.2 × 318.2 mm |
| 主壳体平面尺寸 | 约 108 × 184 mm |
| 总高度 | 约 250 mm |
| 桨直径 | 254 mm / 10 英寸 |
| 电机外径与高度 | 28 mm / 30 mm |
| 电池金属壳体 | 155 × 48 × 40 mm |

输入说明中的“机身 320 × 320 mm”与紧凑机身参考图、450 mm 轴距和 10 英寸桨存在比例冲突。本模型将 320 mm 理解为电机中心方形跨度，中央机身采用参考图的紧凑比例。两个 CW 与两个 CCW 桨具有相反的桨叶螺距几何。

## 编辑与动画

根对象为 `Quadrotor_UAV`。`Main_Body`、`Carbon_Frame`、`Motor_FL/FR/RL/RR`、`Propeller_System`、`Flight_Controller`、`Battery_Module`、`Camera_Gimbal` 和 `Communication_Module` 均为独立层级。配电、电调、前置传感器和起落架也独立分组。

Blender 源文件保留逐件可编辑的螺钉、线束、壳体、光学镜片、铜绕组和线路板。碳纤维纹理已打包。GLB 将这些细件合并到 18 个模块网格中，保留转台、拆解与桨叶中心层级，采用 glTF 的 Y 轴向上坐标。

时间轴为 30 fps：

- 第 1–180 帧：360° 转台。
- 第 200–280 帧：分层拆解。
- 第 280–320 帧：拆解状态停留；第 300 帧适合查看内部结构。
- 第 320–400 帧：重新装配。

命名相机包括 `Camera_Hero`、`Camera_Exploded`、`Camera_Front`、`Camera_Side`、`Camera_Top` 及三组特写。静态展示图使用 Cycles，视频使用 Eevee。

## 脚本

`01_build_structure.py` 至 `04_refine_and_save.py` 保存建模与材质过程；`render_presentation.py` 生成展示图和视频；`export_web.py` 生成网站资产。

在当前电脑重建基础模型，可用 Blender 后台执行 `rebuild_model.py`；应带 `--factory-startup`，确保生成统一的对象名。最终源文件已经保存，可直接打开编辑。

GLB 动画片段名为 `360_Turntable_and_Exploded_Assembly`，覆盖完整 Blender 展示序列。
