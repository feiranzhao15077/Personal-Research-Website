# RQ-4 Global Hawk 展示模型

根据用户提供的设计图和建模说明，在 Blender 5.2 中通过 Blender MCP 制作。
采用米制：机身长 14.5 m，机翼翼展 39.9 m，尾翼高度约 4.7 m。
内部航电、支撑框架及 SAR 阵列为科研展示示意结构。

## 文件

- `RQ4_Global_Hawk.blend`：可编辑工程，含模块化部件、材质、灯光、相机及动画。
- `RQ4_Global_Hawk.glb`：网站静态模型，约 6.5 MiB，19 个网格、约 27.7 万三角面。
- `RQ4_Global_Hawk_Animated.glb`：网站动画模型，含 `RQ4_Demonstration` 动画。
- `RQ4_Hero.png`：1800 × 1200 整体展示图。
- `RQ4_Exploded.png`：结构分解展示图。
- `RQ4_EOIR_Detail.png`、`RQ4_Engine_Detail.png`、`RQ4_Gear_Detail.png`：细节渲染。
- `RQ4_Top.png`、`RQ4_Front.png`、`RQ4_Side.png`：透明背景正交视图。
- `RQ4_Turntable_360.mp4`、`RQ4_Exploded_Assembly.mp4`：960 × 640 动画预览。
- `references/`：用户提供的参考图和原始建模说明。

## Blender 编辑与播放

打开 `.blend`，在 Outliner 中展开 `RQ4 | Aircraft Assemblies`。
根对象 `RQ4_Global_Hawk` 下设机身、机翼、V 尾、发动机、EO/IR、SAR、通信天线、起落架与航电组件。
襟翼、副翼及尾翼控制面分别保留；`Control_Surface` 系统由这些部件的对象属性标记。
`RQ4 | Exhibition Studio` 保存展台、字体标识、灯光和相机，GLB 仅包含飞机。

| 时间线 | 展示内容 |
|---|---|
| 1–240 帧 | 360° 旋转 |
| 241–301 帧 | 组件分解展开 |
| 301–385 帧 | 分解结构停留 |
| 385–455 帧 | 重新组装 |
| 455–480 帧 | 完整机体 |

时间线帧率 30 fps。相机标记自动切换整体与分解视角。
相机名称使用 `RQ4_Camera_` 前缀；EOIR、Engine、Gear 提供细节视角。

## 网站使用

静态展示使用 `RQ4_Global_Hawk.glb`；需要结构展示时使用带动画版本。
GLB 使用 glTF 标准 Y 向上坐标，保留米制与组件层级。
`RQ4_Demonstration` 的前 8 秒为旋转，随后约 8 秒为分解与组装。
可在 Three.js、Babylon.js 或其他支持 glTF 动画的查看器中播放。
PBR 材质和光学玻璃随 GLB 导出，Blender 涂层的程序化细微纹理保留在工程中。

## 构建脚本

`build_rq4.py` 在 Blender 中生成模型并保存独立工程；
`finish_rq4.py` 完成表面法线、材质和分件接缝；
`export_rq4.py` 从工程导出网站模型；
`render_rq4.py -- final` 输出渲染和正交视图，`-- animation` 输出动画预览。
脚本之间按上述顺序运行。最终工程可直接编辑，无需重新执行脚本。

原先打开的四旋翼工程保留，额外备份位于工作目录 `_previous_project/`，交付压缩包仅包含本次 RQ-4 成果。
