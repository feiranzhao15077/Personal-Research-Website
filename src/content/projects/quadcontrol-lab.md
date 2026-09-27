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
  zh: 配对实验、Layer A 与 Layer B 结果已有冻结索引；均为特定 deterministic synthetic protocol。
summary:
  zh: 在确定性四旋翼仿真中只改变控制器的观测来源，比较闭环差异并检查姿态估计器的 specific-force 假设。
researchQuestion:
  zh: 在其他闭环条件一致时，仅改变 controller 消费的 observation source，闭环姿态行为如何变化？MinimalAttitudeEstimator 的 specific-force
    gravity-direction assumption 如何与 estimator roll behavior 关联？
whyItMatters:
  zh: 将 plant、controller、mixer、actuator、scheduler、reference 与初始化固定，比较 IDEAL_BENCHMARK 和 ESTIMATED_ATTITUDE_LOOP。进一步通过输入层与全环证据检查机制解释，并保留
    estimator failure / divergence 作为研究现象。
methods:
- zh: 13D numerical state；ENU / FLU；Hamilton q_wb。
- zh: Newton–Euler plant 与 RK4 integration。
- zh: controller、mixer、motor/actuator chain。
- zh: SensorContext 与 observation contract；IdealImu；MinimalAttitudeEstimator。
- zh: deterministic scheduler、seed 与 artifact provenance。
- zh: Formal paired experiment → Layer A input mechanism → Layer B full-loop replay/accounting。
contributions:
- zh: 现有项目材料记录的工作包括刚体动力学、混控与电机模型、闭环仿真及自动化验证；个人分工措辞待最终 CV 核对。
representativeResults: &id001
- QC-01
- QC-02
- QC-04
limitations:
- zh: Synthetic deterministic；seed 0 paired experiment；+10° roll ATTITUDE_STEP；10 s。
- zh: No sensor noise、bias 或外部 disturbance。
- zh: No hardware、HIL、real flight、EKF 或 full-state estimator。
- zh: No stability proof；不推断跨 seed 统计泛化、真实传感器鲁棒性或飞行安全。
- zh: R_C 只是两项净累计 estimator roll-error budget 的相对量，不是车辆轨迹的因果份额。
- zh: 独立 source repository 为 PRIVATE — authenticated access available, not anonymously public；公开 evidence
    index 列出源 commit 与 artifact hashes，raw bundle 尚未逐项核验。
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

观测来源变化可以对应明显闭环差异。受控 Layer A 与全环 Layer B 支持 specific-force direction assumption 与 estimator roll behavior 的机制一致性；同时，估计器偏差和发散是研究内容，不能隐藏。

## 证据阅读说明

本页的数值、状态与解释边界由下方证据条目提供；请连同实验协议阅读。
