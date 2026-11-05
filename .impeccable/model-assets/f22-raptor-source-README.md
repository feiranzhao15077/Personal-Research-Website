# F-22 Raptor Blender 展示模型

按提供的三视图与建模要求，在 Blender 5.2.1 中通过 Blender MCP 制作。原 RQ-4 项目保留在原目录。

## 交付文件

- `F22_Raptor.blend`：可编辑模型、30 种材质、实验室场景、灯光、19 个摄影机和动画时间轴。整体、头部与后部参考图片已打包。
- `F22_Raptor.glb`：静态网页展示模型，仅包含飞机。
- `F22_Raptor_Animated.glb`：包含完整展示动画的网页模型；动画名为 `F22_Exhibition`。
- `F22_Hero.png`、`F22_Rear.png`：整体展示渲染。
- `F22_Cockpit_Detail.png`、`F22_Nozzles_Detail.png`、`F22_Landing_Gear_Detail.png`、`F22_Weapon_Bay_Open.png`：座舱、喷口、起落架和弹舱细节。
- `F22_Takeoff.png`：起飞展示姿态。
- `F22_Head_Detail.png`、`F22_Head_Side.png`、`F22_Head_Front.png`、`F22_Head_Top.png`：第二版头部的透视、侧面、正面与顶部细节。
- `F22_Aft_Rear.png`、`F22_Aft_Detail.png`、`F22_Aft_Underside.png`、`F22_Aft_Gear.png`：第三版后部的正后视、斜后视、下表面与主起落架站姿。
- `F22_Top.png`、`F22_Front.png`、`F22_Side.png`、`F22_Bottom.png`：透明背景正交视图。
- `F22_Turntable_360.mp4`、`F22_Weapon_Bay_Animation.mp4`、`F22_Takeoff_Display.mp4`：三段动画预览。
- `model_manifest.json`、`web_export_report.json`：比例、组件、时间轴和导出信息。

## Blender 使用

打开 `F22_Raptor.blend`。场景 `F-22 | Aerospace Laboratory` 默认处于第 1 帧、Rear_Orthographic 摄影机视角。按空格播放时间轴；按小键盘 0 切换摄影机视图。

| 帧区间（30 fps） | 内容 |
| --- | --- |
| 1–241 | 360°旋转 |
| 271–391 | 主弹舱与侧弹舱开合 |
| 421–660 | 起飞、起落架收起、喷口偏转及返回展示姿态 |

可在摄影机列表中切换 `Hero`、`Rear`、`Cockpit`、`Nozzles`、`Landing_Gear`、`Weapon_Bay`、`Takeoff` 与四个正交摄影机。观察打开的弹舱时，选择 `Weapon_Bay` 并切至第 328 帧；起飞姿态使用 `Takeoff`、第 541 帧。

新增 `Head_Detail`、`Head_Side`、`Head_Front`、`Head_Top` 四个头部摄影机。第二版按新的头部参考重建了尖鼻的纵向与横向曲率、上下表面的侧棱、曲面雷达罩接缝、贴合机身的金色座舱罩与窄框，以及贴面检修线、紧固件和传感器窗口。原版本备份位于 `revisions/F22_Raptor_before_head_v2.blend`。

第三版新增 `Rear_Orthographic`、`Aft_Detail`、`Aft_Underside`、`Aft_Gear` 四个后部摄影机。后机身采用加宽的平缓上表面和带折面的下表面；双垂尾外倾约 26°，主轮中心间距约 3.8 m。双喷口重建为敞开的矩形内腔、锯齿内唇、上下调节片、隔热侧壁与执行机构，并保留原有喷口偏转动画。水平尾翼根部位于喷口外侧，机翼与尾翼后缘已拉平并减薄。

第四版按反馈修正了喷口过大的问题：单喷口调节片宽度由约 1.984 m 收至 1.52 m，出口高度由约 0.825 m 收至 0.52 m，分别减少约 23% 和 37%。侧框厚度由约 45 mm 减至 28 mm，调节片也同步减薄。后段机身与短舱向喷口收拢，并采用独立的深灰钛合金材质。修改前版本位于 `revisions/F22_Raptor_before_nozzle_v4.blend`。

后部参考图的数字标注仅作视觉提示：模型按图像轮廓及各结构之间的关系调整，未把所有标注当作精确工程尺寸。修改前的头部第二版备份位于 `revisions/F22_Raptor_before_aft_v3.blend`。

`F22_Raptor` 根对象下包括雷达罩、座舱、机身、左右机翼、双垂尾、水平尾翼、左右发动机、喷口、弹舱、起落架及表面标识。门、起落架和喷口各有独立运动轴。

## 比例与内容

模型以米为单位，外形以 18.9 m 机长、13.6 m 翼展、约 5.1 m 高度为目标。资料见[美国空军 F-22 公开说明](https://www.jble.af.mil/About-Us/Fact-Sheets/show/Article/104506/f-22-raptor/)。

包含梯形机翼与独立控制面、外倾双垂尾、开放式梯形进气口与曲折内壁、双矩形喷口、金色透射玻璃、低可视度标识、三组起落架、主/侧弹舱及内部展示挂架。

本模型用于视觉展示。内部结构与挂架为参考示意；未进行气动、结构或雷达散射仿真，不能从外观模型推断实际 RCS 或性能。

## 网页接入

GLB 以米为单位，采用 glTF 标准 Y 向上。所有文件已嵌入所需模型数据，实验室平台、摄影机及灯光不在 GLB 中。固定细节按组件合并，独立的运动节点得到保留。渲染用微表面程序纹理在 GLB 中用标准 PBR 颜色与粗糙度表示；建议使用支持透射与清漆扩展的查看器。

完整动画约 22 秒：0–8 秒旋转，9–13 秒弹舱展示，14–22 秒起飞展示。网站可按这些区间播放。

## 脚本

`build_f22.py` 为完整构建入口，应在新的空白 Blender 文件中运行。`f22_systems.py`、`f22_presentation.py`、`f22_finish.py`、`refine_f22_head.py`、`refine_f22_aft.py` 为构建阶段脚本；`render_f22.py` 与 `export_f22.py` 可对保存的模型渲染和导出。调整头部参数后，依次运行头部与后部优化脚本；仅调整后部时可单独运行 `refine_f22_aft.py`。

动画预览采用 Eevee、960×640、15 fps；静帧使用 Cycles。主图与细节图为 1920×1280，正交图另按机体比例设置尺寸。
