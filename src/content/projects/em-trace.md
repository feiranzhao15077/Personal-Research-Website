---
id: em-trace
slug: em-trace
title:
  zh: EM-Trace
subtitle:
  zh: 参数化旋翼建模、全波求解与可审计信号链
role: ENGINEERING_FOUNDATION
researchTrack:
  zh: 计算电磁工程 / 坐标与极化约定 / 数值敏感性 / 可追溯处理
status:
  zh: 工程流程、方向约定与敏感性审计已冻结；数值结果仅作工程基线，不主张高精度收敛或正确后向完整微动验证。
summary:
  zh: 沿参数化 CAD、CST、复场提取与 Python 处理链审计坐标、方向、极化和结果来源的一致性。
researchQuestion:
  zh: 如何让几何建模 → 坐标系 → 入射与观测方向 → 极化 → 复场提取 → 信号处理保持一致、可追溯、可审计？
whyItMatters:
  zh: 工程链中的方向、极化、网格与计算域约定会直接决定结果是否可解释。项目展示的不只是完成软件操作，而是在发现方向、数值稳定性或计算域问题后，建立可复核的诊断并据此缩小结论范围。
methods:
- zh: 参数化 CAD → STEP AP214 → CST 频域求解 → 复远场提取 → 坐标与极化核查 → Python 慢时间与 STFT 处理。核查项包括坐标、极化、网格敏感性、计算域敏感性与信号处理链。
contributions:
- zh: 使用 CST Studio Suite 与 Python 搭建 CAD—全波仿真—复场提取链路，通过坐标、方向与极化审计修正后向散射解释。
representativeResults: &id001
- EMT-01
- EMT-04
- EMT-05
limitations:
- zh: 未包含实测雷达；没有稳定的、完整且正确后向的定量微动链。
- zh: 不主张高精度 RCS 收敛；M1 单旋翼姿态网格稳定性未达门限。
- zh: A3 显示计算域敏感性；不同计算域之间的结构增量解释已撤回。
- zh: Stage 7 仅作流程展示；不能将历史前向快照解释为后向微多普勒。
- zh: 不把预置周期产生的频率峰值当作独立物理验证。
figures:
- FIG-EMT-01
- FIG-EMT-02
mainFigures:
- FIG-EMT-01
- FIG-EMT-02
deepFigures: []
materials:
- overview
- portfolio
- evidence-em-trace
- selected-code
evidenceRefs:
- EMT-01
- EMT-02
- EMT-03
- EMT-04
- EMT-05
sourceOfTruth: Phase 2 reviewed project pack and evidence registry; numerical claims are keyed by evidence
  ID
heroEvidence: EMT-01
mainEvidence: *id001
deepEvidence:
- EMT-02
- EMT-03
homeEvidence: EMT-01
localeState:
  zh: READY
  en: PENDING
---

### 研究认识

坐标、传播方向、极化和计算域约定直接决定电磁结果能否解释。审计后修正方向并降低数值主张，是工程证据链的一部分。

### 如何复核

本页的数值、证据状态与解释边界见“代表结果与解释边界”部分；请连同实验协议阅读。
