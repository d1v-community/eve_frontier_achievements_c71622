export type MedalLocale = 'en' | 'zh-CN' | 'is'

const MEDAL_BASE_CATALOG = [
  {
    kind: 1,
    slug: 'bloodlust-butcher',
    subtitle: 'Bloodlust Butcher',
    rarity: 'Legendary',
    tone: 'crimson',
    translations: {
      en: {
        title: 'Bloodlust Butcher',
        requirement:
          'Accumulate 5 attacker records in indexed killmail activity.',
        teaser: 'Turn every confirmed kill into a traceable combat coordinate.',
      },
      'zh-CN': {
        title: '嗜血屠夫',
        requirement: '在击杀记录索引中累计 5 次攻击者事件。',
        teaser: '让每一次击毁都留下可验证的血色坐标。',
      },
      is: {
        title: 'Blóðþyrstur slátrari',
        requirement: 'Safnaðu 5 árásarskrám úr skráðri killmail virkni.',
        teaser: 'Breytðu hverju staðfestu drápi í rekjanlegt bardagahnit.',
      },
    },
  },
  {
    kind: 2,
    slug: 'void-pioneer',
    subtitle: 'Void Pioneer',
    rarity: 'Epic',
    tone: 'azure',
    translations: {
      en: {
        title: 'Void Pioneer',
        requirement:
          'Anchor 1 network node, or anchor 3 storage units in total.',
        teaser:
          'You did not merely pass the frontier. You pinned infrastructure into it.',
      },
      'zh-CN': {
        title: '深空拓荒者',
        requirement: '锚定 1 个网络节点，或累计锚定 3 个储存单元。',
        teaser: '你不是路过边境的人，你是把边境钉在星图上的人。',
      },
      is: {
        title: 'Frumherji tómsins',
        requirement: 'Festu 1 nethnút eða samtals 3 geymslueiningar.',
        teaser: 'Þú fórst ekki bara um jaðarinn. Þú negldir innviði inn í hann.',
      },
    },
  },
  {
    kind: 3,
    slug: 'galactic-courier',
    subtitle: 'Galactic Courier',
    rarity: 'Rare',
    tone: 'teal',
    translations: {
      en: {
        title: 'Galactic Courier',
        requirement: 'Complete 10 gate::jump transitions.',
        teaser: 'Civilization runs on repeated arrivals, not on gunfire alone.',
      },
      'zh-CN': {
        title: '星际物流商',
        requirement: '完成 10 次星门跃迁。',
        teaser: '真正让文明运转的，从来不是炮火，而是持续抵达的货舱。',
      },
      is: {
        title: 'Vetrarbrautasendiboði',
        requirement: 'Ljúktu 10 stjörnuhliðarstökkum.',
        teaser: 'Siðmenningin gengur fyrir endurteknum komum, ekki bara skotbardögum.',
      },
    },
  },
  {
    kind: 4,
    slug: 'turret-sentry',
    subtitle: 'Turret Sentry',
    rarity: 'Uncommon',
    tone: 'amber',
    translations: {
      en: {
        title: 'Turret Sentry',
        requirement: 'Deploy or operate turrets 3 times.',
        teaser:
          'Every active turret is a declaration that this patch of space is defended.',
      },
      'zh-CN': {
        title: '炮塔哨卫',
        requirement: '部署或操作炮塔达 3 次。',
        teaser: '每一门炮塔都是主权的宣言——你告诉宇宙，这片空间有人守着。',
      },
      is: {
        title: 'Turnvörður',
        requirement: 'Settu upp eða stjórnaðu turnum 3 sinnum.',
        teaser: 'Hver virkur turn er yfirlýsing um að þetta svæði geimsins sé varið.',
      },
    },
  },
  {
    kind: 5,
    slug: 'assembly-pioneer',
    subtitle: 'Assembly Pioneer',
    rarity: 'Uncommon',
    tone: 'steel',
    translations: {
      en: {
        title: 'Assembly Pioneer',
        requirement: 'Complete 3 Smart Assembly interactions.',
        teaser:
          'Every assembly you wake up becomes another live coordinate on the frontier production map.',
      },
      'zh-CN': {
        title: '装配先驱',
        requirement: '与智能装配交互达 3 次。',
        teaser:
          '你搭起来的每一个装配体，都是 Frontier 基础设施版图上的新坐标。',
      },
      is: {
        title: 'Samsetningarfrumherji',
        requirement: 'Ljúktu 3 Smart Assembly samskiptum.',
        teaser:
          'Hver samsetning sem þú vekur verður nýtt lifandi hnit á framleiðslukorti Frontier.',
      },
    },
  },
  {
    kind: 6,
    slug: 'turret-anchor',
    subtitle: 'Turret Anchor',
    rarity: 'Rare',
    tone: 'amber',
    translations: {
      en: {
        title: 'Turret Anchor',
        requirement: 'Permanently anchor turrets 3 times.',
        teaser:
          'Each turret locked into the map is a long-term territorial statement.',
      },
      'zh-CN': {
        title: '炮台筑防者',
        requirement: '永久部署（锚定）炮台达 3 次。',
        teaser: '每一门永久钉入星图的炮台，都是你主权意志的宣言。',
      },
      is: {
        title: 'Turnfestir',
        requirement: 'Festu turna varanlega 3 sinnum.',
        teaser:
          'Hver turn sem er negldur í kortið er langtímayfirlýsing um yfirráð.',
      },
    },
  },
  {
    kind: 7,
    slug: 'ssu-trader',
    subtitle: 'SSU Trader',
    rarity: 'Uncommon',
    tone: 'teal',
    translations: {
      en: {
        title: 'SSU Trader',
        requirement:
          'Complete 5 cargo deposit or withdraw operations through Smart Storage Units.',
        teaser:
          'Supply chains do not appear from nowhere. Your cargo flow keeps the frontier economy moving.',
      },
      'zh-CN': {
        title: '星际贸易商',
        requirement: '通过智能存储单元完成 5 次货物存取操作。',
        teaser: '供应链不会无中生有——是你的货舱让 Frontier 的经济持续运转。',
      },
      is: {
        title: 'SSU kaupmaður',
        requirement:
          'Ljúktu 5 inn- eða úttektum í Smart Storage Units.',
        teaser:
          'Aðfangakeðjur birtast ekki af sjálfu sér. Vöruflæðið þitt heldur efnahag Frontier gangandi.',
      },
    },
  },
  {
    kind: 8,
    slug: 'fuel-feeder',
    subtitle: 'Fuel Feeder',
    rarity: 'Uncommon',
    tone: 'steel',
    translations: {
      en: {
        title: 'Fuel Feeder',
        requirement: 'Feed fuel into network nodes 5 times.',
        teaser:
          'Infrastructure lights stay on because somebody keeps refilling the network.',
      },
      'zh-CN': {
        title: '节点燃料官',
        requirement: '向网络节点投喂燃料达 5 次。',
        teaser: '基地的灯不会自己亮。每一次投喂，都是对整个网络的承诺。',
      },
      is: {
        title: 'Hnútakeldsneytisgjafi',
        requirement: 'Gefðu nethnútum eldsneyti 5 sinnum.',
        teaser:
          'Ljós innviðanna haldast kveikt af því að einhver heldur áfram að fylla á netið.',
      },
    },
  },
] as const

type MedalCatalogEntry = (typeof MEDAL_BASE_CATALOG)[number]

export interface MedalDefinition {
  kind: MedalCatalogEntry['kind']
  slug: MedalCatalogEntry['slug']
  title: string
  subtitle: MedalCatalogEntry['subtitle']
  rarity: MedalCatalogEntry['rarity']
  requirement: string
  teaser: string
  tone: MedalCatalogEntry['tone']
}

export type MedalKind = MedalCatalogEntry['kind']
export type MedalSlug = MedalCatalogEntry['slug']
export type MedalTone = MedalCatalogEntry['tone']

export const resolveMedalLocale = (locale?: string): MedalLocale =>
  locale === 'zh-CN' || locale === 'is' ? locale : 'en'

const buildMedalDefinition = (
  definition: MedalCatalogEntry,
  locale?: string
): MedalDefinition => {
  const resolvedLocale = resolveMedalLocale(locale)
  const localized = definition.translations[resolvedLocale]

  return {
    kind: definition.kind,
    slug: definition.slug,
    title: localized.title,
    subtitle: definition.subtitle,
    rarity: definition.rarity,
    requirement: localized.requirement,
    teaser: localized.teaser,
    tone: definition.tone,
  }
}

export const getLocalizedMedalCatalog = (locale?: string): MedalDefinition[] =>
  MEDAL_BASE_CATALOG.map((definition) =>
    buildMedalDefinition(definition, locale)
  )

export const MEDAL_CATALOG = getLocalizedMedalCatalog('en')

export const getMedalDefinitionByKind = (kind: number, locale?: string) => {
  const definition = MEDAL_BASE_CATALOG.find((entry) => entry.kind === kind)
  return definition ? buildMedalDefinition(definition, locale) : undefined
}

export const getMedalDefinitionBySlug = (slug: string, locale?: string) => {
  const definition = MEDAL_BASE_CATALOG.find((entry) => entry.slug === slug)
  return definition ? buildMedalDefinition(definition, locale) : undefined
}
