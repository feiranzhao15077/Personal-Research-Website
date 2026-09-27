---
id: emvision
slug: emvision
title:
  zh: EMvision
subtitle:
  zh: 复杂电磁环境下旋翼目标微多普勒建模与识别研究
role: FLAGSHIP
researchTrack:
  zh: 计算电磁 / 合成微多普勒识别 / 受控实验与归因审计
status:
  zh: 合成固定测试域结果有公开 evidence summary；底层 n=20 JSON 与 Shapley 来源已内部核验，canonical artifact 位于 PRIVATE 仓库。
summary:
  zh: 在固定合成测试域中，控制训练端通道、生成器族与参数分布匹配，检查识别变化及因素交互。
researchQuestion:
  zh: 在固定 synthetic test domain 上，训练端的 channel matching（C）、generator-family matching（G）与 parameter-distribution
    matching（P）如何影响识别表现及协议内归因？
whyItMatters:
  zh: 当训练域的通道、生成器族与参数分布发生变化时，端点性能无法说明每个因素是否独立起作用。该项目把因素组成 2×2×2 配对协议，并将结论限定在固定合成测试域；重点是识别协议依赖与交互，而非宣称真实雷达部署效果。
methods:
- zh: C / G / P 三个训练端干预组成 2×2×2 full factorial。
- zh: fixed synthetic test domain；8 个角点共享测试目标。
- zh: 20 paired seeds；paired bootstrap；interaction analysis；negative controls。
- zh: 固定 MLP 仅作为 measurement instrument，不是方法创新。
- zh: 测试数据不用于拟合或选择。
contributions:
- zh: 现有项目材料记录的工作包括电磁模型与仿真流程、信号生成、数据处理、实验分析及论文初稿；个人分工措辞待最终 CV 核对。
representativeResults: &id001
- EVM-02
- EVM-03
- EVM-05
- EVM-06
limitations:
- zh: Synthetic only；fixed test domain。
- zh: One 7-D feature set、one fixed MLP measurement instrument。
- zh: 不包含 measured radar、CST 单站外部验证或完整物理模型不确定性；没有实测雷达或真实等离子体验证。
- zh: 所有归因只适用于冻结协议与测试域，不能写成 physical causality 或普适 importance ranking。
- zh: n=20 canonical JSON 位于私有仓库，不能匿名下载；公开复核入口为 Portfolio evidence summary。v011/control raw audit 的公开访问状态仍需分别核实。
figures:
- FIG-EVM-01
- FIG-EVM-02
- FIG-EVM-03
- FIG-EVM-04
materials:
- overview
- portfolio
- evidence-emvision
- selected-code
evidenceRefs:
- EVM-01
- EVM-02
- EVM-03
- EVM-04
- EVM-05
- EVM-06
sourceOfTruth: Phase 2 reviewed project pack and evidence registry; numerical claims are keyed by evidence
  ID
heroEvidence: EVM-02
mainEvidence: *id001
deepEvidence:
- EVM-04
homeEvidence: EVM-02
localeState:
  zh: READY
  en: PENDING
---

## 研究收获

当前冻结协议下存在明显交互，单因素平均贡献不足以概括端点变化。Shapley 在该项目中是六条协议路径的 path-order summary，不是物理因果贡献。v011 的塌缩也说明，只展示 v000 与 v111 会遮蔽中间角点行为。

## 证据阅读说明

本页的数值、状态与解释边界由下方证据条目提供；请连同实验协议阅读。
