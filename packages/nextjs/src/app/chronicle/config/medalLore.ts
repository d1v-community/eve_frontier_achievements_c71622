import type { MedalSlug } from './medals'

export type MedalLorePriority = 'primary' | 'secondary' | 'supporting'
export type MedalLoreLocale = 'en' | 'zh-CN' | 'is'

export interface MedalLoreEntry {
  whyItMatters: string
  frontierContext: string
  shareNarrative?: string
  wikiSources: string[]
  priority: MedalLorePriority
}

type MedalLoreCatalog = Record<MedalLoreLocale, Record<MedalSlug, MedalLoreEntry>>

const CORE_GUIDE =
  'https://evefrontier.wiki/en/Guide/Player-Guides/Comprehensive-Alpha-New-Player-Guide'
const FAQ_GUIDE = 'https://evefrontier.wiki/en/Guide/FAQ'
const MVS_GUIDE = 'https://evefrontier.wiki/en/Guide/Minimum-Viable-System'
const POI_GUIDE = 'https://evefrontier.wiki/en/Guide/Point-of-Interest'
const SITE_LIST_GUIDE = 'https://evefrontier.wiki/en/Guide/Site-List'
const ASSEMBLER_GUIDE = 'https://evefrontier.wiki/en/Structures/Assembler'
const PORTABLE_REFINERY_GUIDE =
  'https://evefrontier.wiki/en/Structures/Portable-Refinery'
const D1_FUEL_GUIDE = 'https://evefrontier.wiki/en/Fuel/Ship-Engine-Fuel/D1-Fuel'

const MEDAL_LORE_CATALOG: MedalLoreCatalog = {
  en: {
    'bloodlust-butcher': {
      whyItMatters:
        'Combat medals mark moments where the Frontier stops being abstract and starts fighting back with names, hulls, and consequences.',
      frontierContext:
        'The community wiki frames hostile sites and contested space as part of everyday survival, which gives this medal world context even though the proof still comes from indexed killmail activity.',
      shareNarrative:
        '5 confirmed kills, all indexed. Bloodlust Butcher now marks the moments where frontier survival turned into recorded combat history. #EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'void-pioneer': {
      whyItMatters:
        'Anchoring a node or enough storage turns empty space into usable territory, not just another place you happened to pass through.',
      frontierContext:
        'The community guide ties L-Points and minimum viable systems directly to base building, which makes this medal read like the first durable mark of frontier settlement.',
      shareNarrative:
        'I did not just pass through the void. I pinned infrastructure into it. Void Pioneer now records that first durable foothold on Sui. #EVEFrontier #FrontierChronicle',
      wikiSources: [POI_GUIDE, MVS_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
    'galactic-courier': {
      whyItMatters:
        'Repeated gate travel is logistics made visible. Routes become supply lines only because someone keeps traversing them.',
      frontierContext:
        'The wiki describes star gates as the connective tissue of movement between systems, which lets this medal represent civilization-scale transit instead of a raw jump counter.',
      shareNarrative:
        '10 gate jumps, all indexed. Galactic Courier is proof that Frontier routes stay alive because somebody keeps moving through them. #EVEFrontier #FrontierChronicle',
      wikiSources: [FAQ_GUIDE, POI_GUIDE],
      priority: 'primary',
    },
    'turret-sentry': {
      whyItMatters:
        'Turret operations say a pilot chose to hold space, not merely travel through it.',
      frontierContext:
        "The wiki's site and POI pages reinforce that dangerous areas, NPC pressure, and defensible locations are part of frontier routine, which gives this medal its defensive posture.",
      shareNarrative:
        'Turrets online, perimeter held. Turret Sentry now preserves the shift from scouting space to actively defending it. #EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'assembly-pioneer': {
      whyItMatters:
        'Assembly interactions are the frontier becoming productive. You are not clicking UI; you are pushing a live manufacturing chain forward.',
      frontierContext:
        'Assembler recipes on the wiki make this medal legible as infrastructure work: inputs, outputs, and time all translate into real production momentum.',
      shareNarrative:
        'Smart Assembly online. Assembly Pioneer now marks the production chain work that turns stockpiles into frontier infrastructure. #EVEFrontier #FrontierChronicle',
      wikiSources: [ASSEMBLER_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
    'turret-anchor': {
      whyItMatters:
        'Anchored defenses are stronger than temporary presence. They signal a long-term decision to claim and hold a position.',
      frontierContext:
        "The wiki's site structure and frontier survival framing make anchored weapons feel less like isolated clicks and more like fixed statements of territorial intent.",
      shareNarrative:
        'Turrets anchored. Territory declared. Turret Anchor now records a fixed defensive claim instead of a passing show of force. #EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'ssu-trader': {
      whyItMatters:
        'Storage traffic is what turns isolated outposts into functioning supply networks with inflow, outflow, and reliable circulation.',
      frontierContext:
        'The player guide treats storage, refining, and movement as one survival chain, so this medal works best as a logistics honor rather than a bare deposit counter.',
      shareNarrative:
        '5 SSU operations, all recorded. SSU Trader stands for the quiet logistics work that keeps frontier stockpiles moving. #EVEFrontier #FrontierChronicle',
      wikiSources: [CORE_GUIDE, FAQ_GUIDE],
      priority: 'primary',
    },
    'fuel-feeder': {
      whyItMatters:
        'Fueling keeps nodes alive. Without replenishment, frontier infrastructure is just a dead shell waiting to go dark.',
      frontierContext:
        'Fuel and refinery pages on the wiki tie extraction, refinement, and downstream usage together, so this medal reads as maintenance labor that keeps the whole network breathing.',
      shareNarrative:
        '5 fuel feeds recorded. Fuel Feeder marks the maintenance work that keeps frontier nodes alive instead of going dark. #EVEFrontier #FrontierChronicle',
      wikiSources: [D1_FUEL_GUIDE, PORTABLE_REFINERY_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
  },
  'zh-CN': {
    'bloodlust-butcher': {
      whyItMatters:
        '战斗类勋章代表你不再只是路过 Frontier，而是真正进入了有名字、有残骸、有后果的冲突现场。',
      frontierContext:
        '社区 wiki 对危险站点和前线生存的描述，能给这枚章补上场景语境；但具体 proof 依然只能来自被索引的 killmail 行为。',
      shareNarrative:
        '5 次确认击杀，全部已被索引。Bloodlust Butcher 记录的不是抽象战绩，而是你在 Frontier 真正留下的战斗历史。#EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'void-pioneer': {
      whyItMatters:
        '锚定节点或足够多的存储单元，意味着你把一片原本空白的空间变成了可经营、可驻留、可扩张的据点。',
      frontierContext:
        'wiki 把 L-Point、最小可行系统和基地建设直接串在一起，所以这枚章天然像“边境定居开始”的证明。',
      shareNarrative:
        '我不是路过这片虚空，我是把基础设施钉进了它。Void Pioneer 现在把这次拓荒坐标永久留在 Sui 上。#EVEFrontier #FrontierChronicle',
      wikiSources: [POI_GUIDE, MVS_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
    'galactic-courier': {
      whyItMatters:
        '反复跃迁不是机械刷数，而是把航线真正跑成补给线，让不同据点之间开始持续流通。',
      frontierContext:
        'wiki 明确把 Star Gate 视作系统间移动的关键节点，因此这枚章更像文明连接的轨迹，而不只是 10 次 jump。',
      shareNarrative:
        '10 次星门跃迁，全部已被索引。Galactic Courier 记录的是把 Frontier 航线真正跑成补给线的人。#EVEFrontier #FrontierChronicle',
      wikiSources: [FAQ_GUIDE, POI_GUIDE],
      priority: 'primary',
    },
    'turret-sentry': {
      whyItMatters:
        '操作炮塔意味着你开始守空间，而不是只在空间里经过。',
      frontierContext:
        'wiki 对站点危险度、NPC 压力和可防守空间的描述，让这枚章更像“守住前线”的姿态，而不是单纯点了几次 turret。',
      shareNarrative:
        '炮塔在线，防线成形。Turret Sentry 记录的是你把自己从过客变成守卫者的那一步。#EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'assembly-pioneer': {
      whyItMatters:
        '装配交互代表 Frontier 开始真正产出。你推动的不是一个按钮，而是一整条生产链。',
      frontierContext:
        'Assembler 页把材料、产物和时间都摊开了，所以这枚章很适合被解释成“把库存变成基础设施能力”的制造行为。',
      shareNarrative:
        'Smart Assembly 已上线。Assembly Pioneer 记录的不是一次按钮交互，而是把库存推成生产力的基础设施劳动。#EVEFrontier #FrontierChronicle',
      wikiSources: [ASSEMBLER_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
    'turret-anchor': {
      whyItMatters:
        '锚定炮台比临时驻留更重，它代表你准备长期守住一个位置，并把意志固定在星图上。',
      frontierContext:
        '结合 wiki 对 frontier 生存和冲突站点的描述，这枚章更像长期防御意图的落钉，而不是一次短暂部署。',
      shareNarrative:
        '炮台已经锚定，领地开始成形。Turret Anchor 记录的是你把防线永久钉进 Frontier 的那一下。#EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'ssu-trader': {
      whyItMatters:
        '存取行为让孤立据点开始形成供应链，库存不再是死物，而是持续流动的经济节奏。',
      frontierContext:
        '玩家指南把存储、精炼、移动看作同一条生存链，所以这枚章最适合被讲成后勤与流转，而不是“点了 5 次仓库”。',
      shareNarrative:
        '5 次 SSU 存取操作已记录。SSU Trader 奖章表彰的，是让 Frontier 库存真正流动起来的后勤劳动。#EVEFrontier #FrontierChronicle',
      wikiSources: [CORE_GUIDE, FAQ_GUIDE],
      priority: 'primary',
    },
    'fuel-feeder': {
      whyItMatters:
        '给节点补燃料，本质上是在给整套基础设施续命。没有这类维护动作，再大的基地也只是会熄火的壳。',
      frontierContext:
        'wiki 的燃料页和精炼页把开采、精炼、消耗链路串得很清楚，所以这枚章天然适合解释成“维持网络呼吸”的维护工作。',
      shareNarrative:
        '5 次节点补燃料已记录。Fuel Feeder 记录的不是杂务，而是让整套 Frontier 网络持续亮着的维护劳动。#EVEFrontier #FrontierChronicle',
      wikiSources: [D1_FUEL_GUIDE, PORTABLE_REFINERY_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
  },
  is: {
    'bloodlust-butcher': {
      whyItMatters:
        'Bardagamedalíur marka augnablikin þegar Frontier hættir að vera óhlutbundið og fer að svara með nöfnum, skrokkum og afleiðingum.',
      frontierContext:
        'Samfélagswikið rammar inn óvinveitt svæði og umdeilt geimrými sem daglegan hluta af því að lifa af, sem gefur þessari medalíu heimssamhengi þó sönnunin komi enn úr skráðri killmail virkni.',
      shareNarrative:
        '5 staðfest dráp, öll skráð. Bloodlust Butcher merkir nú augnablikin þegar afkoma í Frontier varð að skráðri bardagasögu. #EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'void-pioneer': {
      whyItMatters:
        'Að festa nethnút eða nóg af geymslueiningum breytir auðu rými í nýtanlegt yfirráðasvæði, ekki bara stað sem þú fórst hjá.',
      frontierContext:
        'Leiðarvísir samfélagsins tengir L-Points og minimum viable systems beint við grunnbyggingu, svo þessi medalía les eins og fyrsta varanlega merki landnáms á jaðrinum.',
      shareNarrative:
        'Ég fór ekki bara í gegnum tómið. Ég negldi innviði inn í það. Void Pioneer skráir nú fyrsta varanlega fótfestuna á Sui. #EVEFrontier #FrontierChronicle',
      wikiSources: [POI_GUIDE, MVS_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
    'galactic-courier': {
      whyItMatters:
        'Endurtekin stjörnuhliðarferð gerir flutningakerfið sýnilegt. Leiðir verða ekki að aðfangaleiðum nema einhver haldi áfram að fara þær.',
      frontierContext:
        'Wikið lýsir stjörnuhliðum sem bandvef hreyfingar milli kerfa, sem lætur þessa medalíu standa fyrir siðmenningarflutninga í stað hrárrar stökkatölu.',
      shareNarrative:
        '10 stjörnuhliðarstökk, öll skráð. Galactic Courier sannar að leiðir Frontier haldast lifandi því einhver heldur áfram að fara þær. #EVEFrontier #FrontierChronicle',
      wikiSources: [FAQ_GUIDE, POI_GUIDE],
      priority: 'primary',
    },
    'turret-sentry': {
      whyItMatters:
        'Turnvirkni segir að flugmaður hafi ákveðið að halda svæði, ekki bara ferðast í gegnum það.',
      frontierContext:
        'Síður wikisins um svæði og POI undirstrika að hættuleg svæði, NPC þrýstingur og varanlegar varnarlínur séu eðlilegur hluti Frontier, sem gefur þessari medalíu skýra varnarsvip.',
      shareNarrative:
        'Turnar online, jaðarinn haldinn. Turret Sentry varðveitir nú skrefið frá því að skima geiminn yfir í að verja hann virkt. #EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'assembly-pioneer': {
      whyItMatters:
        'Samsetningarsamskipti eru augnablikið þegar Frontier fer að framleiða. Þú ert ekki að ýta á viðmót, heldur að ýta lifandi framleiðslukeðju áfram.',
      frontierContext:
        'Assembler uppskriftirnar á wiki gera þessa medalíu læsilega sem innviðavinnu: aðföng, afurðir og tími breytast öll í raunverulegan framleiðsluskriðþunga.',
      shareNarrative:
        'Smart Assembly online. Assembly Pioneer markar nú vinnuna í framleiðslukeðjunni sem breytir birgðum í Frontier innviði. #EVEFrontier #FrontierChronicle',
      wikiSources: [ASSEMBLER_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
    'turret-anchor': {
      whyItMatters:
        'Festar varnir vega þyngra en tímabundin nærvera. Þær sýna langtímaákvörðun um að gera tilkall til stöðu og halda henni.',
      frontierContext:
        'Uppbygging staða á wiki og áherslan á afkomu á Frontier láta fest vopn líða minna eins og staka smelli og meira eins og fasta yfirlýsingu um landhelgi.',
      shareNarrative:
        'Turnar festir. Svæði lýst yfir. Turret Anchor skráir nú fasta varnarkröfu í stað tímabundinnar sýningar á valdi. #EVEFrontier #FrontierChronicle',
      wikiSources: [SITE_LIST_GUIDE, POI_GUIDE, FAQ_GUIDE],
      priority: 'supporting',
    },
    'ssu-trader': {
      whyItMatters:
        'Geymsluumferð er það sem breytir einangruðum útvörðum í starfandi aðfanganet með innstreymi, útstreymi og áreiðanlegri hringrás.',
      frontierContext:
        'Leiðarvísir leikmanna fjallar um geymslu, hreinsun og hreyfingu sem eina samfellda afkomukeðju, svo þessi medalía virkar best sem heiður fyrir hljóðlátt flutningastarf fremur en beran talnateljara.',
      shareNarrative:
        '5 SSU aðgerðir, allar skráðar. SSU Trader stendur fyrir hljóðláta flutningavinnuna sem heldur birgðum Frontier á hreyfingu. #EVEFrontier #FrontierChronicle',
      wikiSources: [CORE_GUIDE, FAQ_GUIDE],
      priority: 'primary',
    },
    'fuel-feeder': {
      whyItMatters:
        'Eldsneytisgjöf heldur hnútum lifandi. Án endurfyllingar eru innviðir Frontier bara dauð skel sem bíður eftir að slokkna.',
      frontierContext:
        'Síður wikisins um eldsneyti og hreinsun tengja saman vinnslu, hreinsun og notkun niðurstreymis, svo þessi medalía les eins og viðhaldsvinna sem heldur öllu netinu á lífi.',
      shareNarrative:
        '5 eldsneytisgjafir skráðar. Fuel Feeder heiðrar viðhaldsvinnuna sem heldur hnútum Frontier lifandi í stað þess að láta þá slokkna. #EVEFrontier #FrontierChronicle',
      wikiSources: [D1_FUEL_GUIDE, PORTABLE_REFINERY_GUIDE, CORE_GUIDE],
      priority: 'primary',
    },
  },
}

export const resolveMedalLoreLocale = (locale?: string): MedalLoreLocale =>
  locale === 'zh-CN' || locale === 'is' ? locale : 'en'

export const getMedalLoreBySlug = (
  slug: MedalSlug,
  locale?: string
): MedalLoreEntry => {
  const resolvedLocale = resolveMedalLoreLocale(locale)
  return MEDAL_LORE_CATALOG[resolvedLocale][slug]
}
