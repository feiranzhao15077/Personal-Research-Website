/** Names in an imaginary knowledge sky; positions express composition and depth. */
export type DreamFamily = 'field' | 'motion' | 'thought';
export type DreamTier = 'near' | 'middle' | 'far';
export interface DreamPlanet { name: string; family: DreamFamily; tier: DreamTier; }

const near: [string, DreamFamily][] = [
  ['麦克斯韦', 'field'], ['牛顿', 'motion'], ['爱因斯坦', 'motion'],
  ['图灵', 'thought'], ['安培', 'field'], ['高斯', 'field'],
];
const middle: [string, DreamFamily][] = [
  ['法拉第', 'field'], ['诺特', 'thought'], ['普朗克', 'motion'],
  ['伽利略', 'motion'], ['开普勒', 'motion'], ['玻尔', 'thought'],
  ['欧拉', 'thought'], ['傅里叶', 'thought'], ['万有引力', 'motion'],
  ['能量守恒', 'motion'], ['最小作用量原理', 'motion'], ['麦克斯韦方程组', 'field'],
];
const far: [string, DreamFamily][] = [
  ['薛定谔', 'thought'], ['海森堡', 'thought'], ['狄拉克', 'thought'],
  ['费曼', 'thought'], ['玻尔兹曼', 'motion'], ['居里', 'field'],
  ['泊松', 'thought'], ['拉普拉斯', 'thought'], ['黎曼', 'thought'],
  ['香农', 'thought'], ['熵增原理', 'motion'], ['动量守恒', 'motion'],
  ['角动量守恒', 'motion'], ['电磁感应', 'field'], ['洛伦兹力', 'field'],
  ['高斯定律', 'field'], ['相对性原理', 'motion'], ['光速不变原理', 'motion'],
  ['波粒二象性', 'thought'], ['测不准原理', 'thought'],
  ['傅里叶变换', 'thought'], ['图灵机', 'thought'],
];

export const dreamPlanets: DreamPlanet[] = [
  ...near.map(([name, family]) => ({ name, family, tier: 'near' as const })),
  ...middle.map(([name, family]) => ({ name, family, tier: 'middle' as const })),
  ...far.map(([name, family]) => ({ name, family, tier: 'far' as const })),
];
