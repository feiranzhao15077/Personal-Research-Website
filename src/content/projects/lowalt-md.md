---
id: lowalt-md
slug: lowalt-md
title:
  zh: LowAlt-MD
subtitle:
  zh: 低空目标微多普勒物理机制与识别验证研究
role: PHYSICS_MECHANISM
researchTrack:
  zh: 低空传播 / Fresnel 多径 / 旋翼微多普勒 / 合成识别边界
status:
  zh: Physics Model v2 科学状态已于 2026-09-14 冻结；当前数字以该版本记录及 results/v2 为准。
summary:
  zh: 用受控物理模型检查低空传播相位如何改变旋翼微多普勒，并审计结构特征跨环境迁移的边界。
researchQuestion:
  zh: 低空传播中的路径相位、逐散射单元复权重与相干叠加，如何改变旋翼微多普勒结构？在受控特征流程下，这些变化如何影响跨环境识别？
whyItMatters:
  zh: 把“多径影响信号”拆成可核对的传播项：公共复增益与逐散射单元非共同复权重不是同一种作用；随后用受控识别和预算匹配实验检查结构特征是否迁移。项目同时保留多环境训练未稳定改善未见高度的负结果。
methods:
- zh: Physics Model v2；M0–M3 分层验证。
- zh: M0 自由空间基线；M1 受限共同复增益；M2 逐单元有效两项机制近似（proxy）；M3 明确 DD / DR / RD / RR 四路径。
- zh: Fresnel 反射、逐单元路径相位与复权重。
- zh: 对路径场相干聚合，再与非相干功率记录比较。
- zh: R2/R2.1 核查识别特征、捷径与置乱对照；R3 同时匹配不重复潜在状态数量与波形数量的预算。
contributions:
- zh: 现有项目材料记录的工作包括传播与散射仿真模型、数据生成、识别实验、置乱检验及泛化分析；个人分工措辞待最终 CV 核对。
representativeResults: &id001
- LOW-01
- LOW-02
- LOW-04
- LOW-05
- LOW-06
- LOW-08
limitations:
- zh: 仅限合成数据、平坦有损地面与低阶镜面多径。
- zh: 各向同性点散射体近似；无实测雷达、经标定的叶片 RCS、粗糙表面或全波环境验证。
- zh: M2 为有效两项机制桥接，不是严格 DD/DR/RD/RR；需要与 M3 的范围区分。
- zh: M1 命题不覆盖时变/频率选择性共同算子、加性噪声或接近零增益。
- zh: 不把 R3 推广为多环境训练普遍无效；仅限定当前 Physics Model v2、结构特征、20/40→80 m 与简单联合训练。
figures:
- FIG-LOW-01
- FIG-LOW-02
mainFigures:
- FIG-LOW-02
- FIG-LOW-01
deepFigures: []
materials:
- overview
- portfolio
- evidence-lowalt-md
- selected-code
evidenceRefs:
- LOW-01
- LOW-02
- LOW-03
- LOW-04
- LOW-05
- LOW-06
- LOW-07
- LOW-08
sourceOfTruth: Phase 2 reviewed project pack and evidence registry; numerical claims are keyed by evidence
  ID
heroEvidence: LOW-01
mainEvidence: *id001
deepEvidence:
- LOW-03
- LOW-07
homeEvidence: LOW-01
localeState:
  zh: READY
  en: PENDING
---

## 研究收获

受限的公共复增益与逐散射单元非共同复权重对归一化谱形具有不同影响；多环境训练是否提升外推取决于预算和协议，当前双预算匹配 R3 没有发现稳定优势。

## 证据阅读说明

本页的数值、证据状态与解释边界见“代表结果与解释边界”部分；请连同实验协议阅读。
