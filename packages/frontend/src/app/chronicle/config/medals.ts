export const MEDAL_CATALOG = [
  {
    kind: 1,
    slug: 'bloodlust-butcher',
    title: '嗜血屠夫',
    subtitle: 'Bloodlust Butcher',
    rarity: 'Legendary',
    requirement: '在 killmail 索引中累计 5 次 attacker 记录。',
    teaser: '让每一次击毁都留下可验证的血色坐标。',
    tone: 'crimson',
  },
  {
    kind: 2,
    slug: 'void-pioneer',
    title: '深空拓荒者',
    subtitle: 'Void Pioneer',
    rarity: 'Epic',
    requirement: '锚定 1 个 network node，或累计锚定 3 个 storage unit。',
    teaser: '你不是路过边境的人，你是把边境钉在星图上的人。',
    tone: 'azure',
  },
  {
    kind: 3,
    slug: 'galactic-courier',
    title: '星际物流商',
    subtitle: 'Galactic Courier',
    rarity: 'Rare',
    requirement: '完成 10 次 gate::jump 跃迁。',
    teaser: '真正让文明运转的，从来不是炮火，而是持续抵达的货舱。',
    tone: 'teal',
  },
] as const

export type MedalDefinition = (typeof MEDAL_CATALOG)[number]
export type MedalKind = MedalDefinition['kind']
export type MedalSlug = MedalDefinition['slug']
export type MedalTone = MedalDefinition['tone']

export const getMedalDefinitionByKind = (kind: number) =>
  MEDAL_CATALOG.find((definition) => definition.kind === kind)

export const getMedalDefinitionBySlug = (slug: string) =>
  MEDAL_CATALOG.find((definition) => definition.slug === slug)
