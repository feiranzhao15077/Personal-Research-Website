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
  zh: 合成固定测试域结果已有公开证据摘要；底层 n=20 JSON 与 Shapley 来源已内部核验，基准结果文件保存在私有仓库。
summary:
  zh: 在固定合成测试域中，控制训练端通道、生成器族与参数分布匹配，检查识别变化及因素交互。
researchQuestion:
  zh: 在固定合成测试域上，训练端的通道匹配（C）、生成器族匹配（G）与参数分布匹配（P）如何影响识别表现及协议内归因？
whyItMatters:
  zh: 当训练域的通道、生成器族与参数分布发生变化时，端点性能无法说明每个因素是否独立起作用。该项目把因素组成 2×2×2 配对协议，并将结论限定在固定合成测试域；重点是识别协议依赖与交互，而非宣称真实雷达部署效果。
methods:
- zh: C / G / P 三个训练端干预组成 2×2×2 全因子设计。
- zh: 固定合成测试域；8 个角点共享测试目标。
- zh: 20 个配对随机种子；配对自助法；交互分析；负对照。
- zh: 固定 MLP 仅作为测量工具，不是方法创新。
- zh: 测试数据不用于拟合或选择。
contributions:
- zh: 现有项目材料记录的工作包括电磁模型与仿真流程、信号生成、数据处理、实验分析及论文初稿；个人分工措辞待最终 CV 核对。
representativeResults: &id001
- EVM-02
- EVM-03
- EVM-05
- EVM-06
limitations:
- zh: 仅限合成数据与固定测试域。
- zh: 仅使用一组 7 维特征与一个固定 MLP 测量工具。
- zh: 不包含实测雷达、CST 单站外部验证或完整物理模型不确定性；没有实测雷达或真实等离子体验证。
- zh: 所有归因只适用于冻结协议与测试域，不能解释为物理因果关系或普适的重要性排序。
- zh: n=20 基准 JSON 文件位于私有仓库，不能匿名下载；公开复核入口为 Research-Portfolio 证据摘要。v011 与对照实验原始审计材料的公开访问状态仍需分别核实。
figures:
- FIG-EVM-01
- FIG-EVM-02
- FIG-EVM-03
- FIG-EVM-04
mainFigures:
- FIG-EVM-03
- FIG-EVM-01
deepFigures:
- FIG-EVM-02
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

当前冻结协议下存在明显交互，单因素平均贡献不足以概括端点变化。Shapley 在该项目中是六条协议路径的顺序摘要，不是物理因果贡献。v011 的塌缩也说明，只展示 v000 与 v111 会遮蔽中间角点行为。

## 证据阅读说明

本页的数值、证据状态与解释边界见“代表结果与解释边界”部分；请连同实验协议阅读。
