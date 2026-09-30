---
id: quadcontrol-lab
slug: quadcontrol-lab
title:
  zh: QuadControl-Lab
subtitle:
  zh: 可审计四旋翼姿态闭环仿真与观测来源机制检查
role: AUTONOMOUS_BRANCH
researchTrack:
  zh: 刚体动力学 / 控制仿真 / 姿态估计 / 确定性审计
status:
  zh: 配对实验、Layer A 与 Layer B 结果已有冻结索引；均基于特定的确定性合成实验协议。
summary:
  zh: 在确定性四旋翼仿真中只改变控制器的观测来源，比较闭环差异并检查姿态估计器的比力假设。
researchQuestion:
  zh: 在其他闭环条件一致时，仅改变控制器使用的观测来源，闭环姿态行为如何变化？MinimalAttitudeEstimator 基于比力的重力方向假设如何与估计器横滚行为关联？
whyItMatters:
  zh: 固定被控对象、控制器、混控器、执行器、调度器、参考信号与初始化条件，比较 IDEAL_BENCHMARK 和 ESTIMATED_ATTITUDE_LOOP。进一步通过输入层与全环证据检查机制解释，并保留估计器失效与发散作为研究现象。
methods:
- zh: 13 维数值状态；ENU / FLU 坐标系；Hamilton q_wb 四元数。
- zh: Newton–Euler 动力学模型与 RK4 积分。
- zh: 控制器、混控器、电机与执行器链。
- zh: SensorContext 与观测约定；IdealImu；MinimalAttitudeEstimator。
- zh: 确定性调度、随机种子与结果文件溯源。
- zh: 正式配对实验 → Layer A 输入层机制 → Layer B 全闭环重放与误差核算。
contributions:
- zh: 现有项目材料记录的工作包括刚体动力学、混控与电机模型、闭环仿真及自动化验证；个人分工措辞待最终 CV 核对。
representativeResults: &id001
- QC-01
- QC-02
- QC-04
limitations:
- zh: 确定性合成实验；随机种子为 0 的配对实验；+10° 横滚 ATTITUDE_STEP；10 s。
- zh: 无传感器噪声、偏置或外部扰动。
- zh: 未包含硬件、硬件在环（HIL）、真实飞行、EKF 或全状态估计器。
- zh: 无稳定性证明；不推断跨随机种子的统计泛化、真实传感器鲁棒性或飞行安全。
- zh: R_C 只是两项净累计估计器横滚误差预算的相对量，不是车辆轨迹的因果份额。
- zh: 独立源代码仓库为私有仓库，需要授权访问，不能匿名下载；公开证据索引列出源提交记录与结果文件哈希值，原始结果包尚未逐项核验。
figures:
- FIG-QC-02
- FIG-QC-03
- FIG-QC-04
- FIG-QC-05
- FIG-QC-06
mainFigures:
- FIG-QC-02
- FIG-QC-03
deepFigures:
- FIG-QC-04
- FIG-QC-05
- FIG-QC-06
materials:
- overview
- portfolio
- evidence-quadcontrol-lab
- selected-code
evidenceRefs:
- QC-01
- QC-02
- QC-03
- QC-04
- QC-05
sourceOfTruth: Phase 2 reviewed project pack and evidence registry; numerical claims are keyed by evidence
  ID
heroEvidence: QC-01
mainEvidence: *id001
deepEvidence:
- QC-03
- QC-05
homeEvidence: QC-01
localeState:
  zh: READY
  en: PENDING
---

## 研究收获

观测来源变化可以对应明显闭环差异。受控 Layer A 与全环 Layer B 支持比力方向假设与估计器横滚行为的机制一致性；同时，估计器偏差和发散是研究内容，不能隐藏。

## 证据阅读说明

本页的数值、证据状态与解释边界见“代表结果与解释边界”部分；请连同实验协议阅读。
