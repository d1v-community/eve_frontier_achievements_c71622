import type { MedalKind, MedalSlug } from './medals'

export type ChronicleBusinessLocale = 'en' | 'zh-CN' | 'is'
export type ChronicleScanMode = 'preview' | 'authenticated'

export const resolveChronicleBusinessLocale = (
  locale?: string
): ChronicleBusinessLocale =>
  locale === 'zh-CN' || locale === 'is' ? locale : 'en'

export const getInsufficientEvidenceLabel = (locale?: string) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return '系统还没有抓到足够的 Frontier 行为证据。'
    case 'is':
      return 'Kerfið hefur ekki enn skráð næg Frontier sönnunargögn.'
    default:
      return 'The system has not indexed enough frontier evidence yet.'
  }
}

export const buildStandardProgressLabel = ({
  slug,
  current,
  target,
  locale,
}: {
  slug: MedalSlug
  current: number
  target: number
  locale?: string
}) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      switch (slug) {
        case 'bloodlust-butcher':
          return `${current} / ${target} 条已索引击杀记录攻击者事件`
        case 'galactic-courier':
          return `${current} / ${target} 次已验证星门跃迁`
        case 'turret-sentry':
          return `${current} / ${target} 次已索引炮塔操作`
        case 'assembly-pioneer':
          return `${current} / ${target} 次智能装配交互`
        case 'turret-anchor':
          return `${current} / ${target} 次炮塔锚定部署`
        case 'ssu-trader':
          return `${current} / ${target} 次 SSU 存取操作`
        case 'fuel-feeder':
          return `${current} / ${target} 次节点燃料补给`
        default:
          return `${current} / ${target}`
      }
    case 'is':
      switch (slug) {
        case 'bloodlust-butcher':
          return `${current} / ${target} skráðir árásaratburðir úr killmail`
        case 'galactic-courier':
          return `${current} / ${target} staðfest stjörnuhliðarstökk`
        case 'turret-sentry':
          return `${current} / ${target} skráðar turnaðgerðir`
        case 'assembly-pioneer':
          return `${current} / ${target} Smart Assembly samskipti`
        case 'turret-anchor':
          return `${current} / ${target} turnfestingar`
        case 'ssu-trader':
          return `${current} / ${target} SSU inn- eða úttektir`
        case 'fuel-feeder':
          return `${current} / ${target} eldsneytisgjafir í nethnút`
        default:
          return `${current} / ${target}`
      }
    default:
      switch (slug) {
        case 'bloodlust-butcher':
          return `${current} / ${target} indexed killmail attacker records`
        case 'galactic-courier':
          return `${current} / ${target} verified gate jumps`
        case 'turret-sentry':
          return `${current} / ${target} indexed turret operations`
        case 'assembly-pioneer':
          return `${current} / ${target} Smart Assembly interactions`
        case 'turret-anchor':
          return `${current} / ${target} turret anchor deployments`
        case 'ssu-trader':
          return `${current} / ${target} SSU deposit or withdraw operations`
        case 'fuel-feeder':
          return `${current} / ${target} network node fuel feeds`
        default:
          return `${current} / ${target}`
      }
  }
}

export const buildVoidPioneerProgressLabel = ({
  networkNodeAnchors,
  storageUnitAnchors,
  locale,
}: {
  networkNodeAnchors: number
  storageUnitAnchors: number
  locale?: string
}) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return `${networkNodeAnchors}/1 个网络节点，或 ${storageUnitAnchors}/3 个储存单元`
    case 'is':
      return `${networkNodeAnchors}/1 nethnútur eða ${storageUnitAnchors}/3 geymslueiningar`
    default:
      return `${networkNodeAnchors}/1 network node or ${storageUnitAnchors}/3 storage units`
  }
}

export const buildStandardProof = ({
  slug,
  current,
  locale,
}: {
  slug: MedalSlug
  current: number
  locale?: string
}) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      switch (slug) {
        case 'bloodlust-butcher':
          return `Eve Eyes 已索引 ${current} 次已确认的击杀记录攻击者事件。`
        case 'galactic-courier':
          return `Eve Eyes 已索引 ${current} 次成功的星门跃迁事件。`
        case 'turret-sentry':
          return `Eve Eyes 已索引 ${current} 次炮塔操作。`
        case 'assembly-pioneer':
          return `Eve Eyes 已索引 ${current} 次智能装配交互。`
        case 'turret-anchor':
          return `Eve Eyes 已索引 ${current} 次炮塔锚定事件。`
        case 'ssu-trader':
          return `Eve Eyes 已索引 ${current} 次 SSU 存取事件。`
        case 'fuel-feeder':
          return `Eve Eyes 已索引 ${current} 次节点燃料补给事件。`
        default:
          return `Eve Eyes 已索引 ${current} 次相关调用。`
      }
    case 'is':
      switch (slug) {
        case 'bloodlust-butcher':
          return `Eve Eyes skráði ${current} staðfesta árásaratburði úr killmail.`
        case 'galactic-courier':
          return `Eve Eyes skráði ${current} heppnuð stjörnuhliðarstökk.`
        case 'turret-sentry':
          return `Eve Eyes skráði ${current} turnaðgerðir.`
        case 'assembly-pioneer':
          return `Eve Eyes skráði ${current} Smart Assembly samskipti.`
        case 'turret-anchor':
          return `Eve Eyes skráði ${current} turnfestingar.`
        case 'ssu-trader':
          return `Eve Eyes skráði ${current} SSU inn- eða úttektir.`
        case 'fuel-feeder':
          return `Eve Eyes skráði ${current} eldsneytisgjafir í nethnút.`
        default:
          return `Eve Eyes skráði ${current} viðeigandi atburði.`
      }
    default:
      switch (slug) {
        case 'bloodlust-butcher':
          return `Eve Eyes indexed ${current} confirmed killmail attacker call(s).`
        case 'galactic-courier':
          return `Eve Eyes indexed ${current} successful gate::jump call(s).`
        case 'turret-sentry':
          return `Eve Eyes indexed ${current} turret operation(s).`
        case 'assembly-pioneer':
          return `Eve Eyes indexed ${current} Smart Assembly interaction(s).`
        case 'turret-anchor':
          return `Eve Eyes indexed ${current} turret::anchor call(s).`
        case 'ssu-trader':
          return `Eve Eyes indexed ${current} SSU deposit/withdraw call(s).`
        case 'fuel-feeder':
          return `Eve Eyes indexed ${current} network_node::feed_fuel call(s).`
        default:
          return `Eve Eyes indexed ${current} relevant call(s).`
      }
  }
}

export const buildVoidPioneerProof = ({
  networkNodeAnchors,
  storageUnitAnchors,
  locale,
}: {
  networkNodeAnchors: number
  storageUnitAnchors: number
  locale?: string
}) => {
  const resolvedLocale = resolveChronicleBusinessLocale(locale)

  if (networkNodeAnchors >= 1) {
    switch (resolvedLocale) {
      case 'zh-CN':
        return `Eve Eyes 已索引 ${networkNodeAnchors} 次成功的网络节点锚定事件。`
      case 'is':
        return `Eve Eyes skráði ${networkNodeAnchors} heppna nethnútsfestingu.`
      default:
        return `Eve Eyes indexed ${networkNodeAnchors} successful network_node::anchor call(s).`
    }
  }

  if (storageUnitAnchors >= 3) {
    switch (resolvedLocale) {
      case 'zh-CN':
        return `Eve Eyes 已索引 ${storageUnitAnchors} 次成功的储存单元锚定事件。`
      case 'is':
        return `Eve Eyes skráði ${storageUnitAnchors} heppnar geymslueiningafestingar.`
      default:
        return `Eve Eyes indexed ${storageUnitAnchors} successful storage_unit::anchor call(s).`
    }
  }

  return null
}

export const buildChronicleActivityWarning = ({
  scanMode,
  locale,
}: {
  scanMode: ChronicleScanMode
  locale?: string
}) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return scanMode === 'authenticated'
        ? 'Eve Eyes 扫描已达到配置页数上限，当前统计可能不完整。'
        : 'Eve Eyes 预览模式只会扫描前几页。配置 EVE_EYES_API_KEY 后才能获取更深历史。'
    case 'is':
      return scanMode === 'authenticated'
        ? 'Eve Eyes skönnun náði stilltu síðutaki. Tölur geta verið ófullkomnar.'
        : 'Eve Eyes preview mode skannar aðeins fyrstu síðurnar. Stilltu EVE_EYES_API_KEY fyrir dýpri sögu.'
    default:
      return scanMode === 'authenticated'
        ? 'Eve Eyes scan hit the configured page cap. Counts may be partial.'
        : 'Eve Eyes preview mode only scans the first few pages. Set EVE_EYES_API_KEY for deeper history.'
  }
}

export const buildClaimTicketFailureWarning = ({
  message,
  locale,
}: {
  message?: string
  locale?: string
}) => {
  const suffix = message?.trim()

  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return suffix ? `领取凭证生成失败：${suffix}` : '领取凭证生成失败。'
    case 'is':
      return suffix
        ? `Ekki tókst að útbúa innlausnarmiða: ${suffix}`
        : 'Ekki tókst að útbúa innlausnarmiða.'
    default:
      return suffix
        ? `Claim ticket generation failed: ${suffix}`
        : 'Claim ticket generation failed.'
  }
}

export const getContractPackageWarning = (locale?: string) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return '当前钱包网络没有配置勋章合约包。进度仍可扫描，但领取已禁用。'
    case 'is':
      return 'Enginn medalíusamningur er stilltur fyrir núverandi veskisnet. Hægt er að skanna framvindu en innlausn er óvirk.'
    default:
      return 'No medals contract package is configured for the current wallet network. Progress can be scanned, but claiming is disabled.'
  }
}

export const getRegistryMissingWarning = (locale?: string) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return '勋章合约包已配置，但暂时还没有定位到共享注册表事件。'
    case 'is':
      return 'Medalíupakkinn er stilltur, en sameiginlegi skráningaratburðurinn fannst ekki enn.'
    default:
      return 'The medals package is configured, but the shared registry event could not be located yet.'
  }
}

export const getClaimSigningWarning = (locale?: string) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return '服务端尚未配置领取签名。已解锁勋章会保持为已验证状态，直到设置 CHRONICLE_CLAIM_SIGNER_PRIVATE_KEY。'
    case 'is':
      return 'Undirritun innlausnar er ekki stillt á þjóninum. Ólæstar medalíur haldast staðfestar þar til CHRONICLE_CLAIM_SIGNER_PRIVATE_KEY er skilgreint.'
    default:
      return 'Claim signing is not configured on the server. Unlocked medals remain verified until CHRONICLE_CLAIM_SIGNER_PRIVATE_KEY is set.'
  }
}

export const getMissingTemplateWarning = (locale?: string) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return '勋章合约包可访问，但链上还没有发现任何启用中的勋章模板。'
    case 'is':
      return 'Medalíupakkinn er aðgengilegur, en engin virk medalíusnið fundust enn á keðjunni.'
    default:
      return 'The medals package is reachable, but no active medal templates were discovered on-chain yet.'
  }
}

export const getDemoModeWarning = (locale?: string) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return '⚠️ 演示模式：当前为模拟数据，仅用于展示流程。'
    case 'is':
      return '⚠️ Sýningarhamur: Þetta eru sýndargögn eingöngu fyrir kynningu.'
    default:
      return '⚠️ DEMO MODE: This is simulated data for demonstration purposes.'
  }
}

export const getMockModeWarning = (locale?: string) => {
  switch (resolveChronicleBusinessLocale(locale)) {
    case 'zh-CN':
      return '[模拟模式] 当前数据仅用于演示流程，不代表任何真实链上交易。'
    case 'is':
      return '[Hermihamur] Núverandi gögn eru aðeins til sýnikennslu og tákna ekki raunveruleg viðskipti á keðju.'
    default:
      return '[MOCK MODE] Current data is simulated for demo flow only and does not represent a live on-chain transaction.'
  }
}

export const buildDemoProof = ({
  kind,
  locale,
}: {
  kind: MedalKind
  locale?: string
}) => {
  switch (kind) {
    case 1:
      switch (resolveChronicleBusinessLocale(locale)) {
        case 'zh-CN':
          return 'Chronicle 已索引 7 条已确认的击杀记录攻击者事件。'
        case 'is':
          return 'Chronicle skráði 7 staðfesta árásaratburði úr killmail.'
        default:
          return 'Chronicle indexed 7 confirmed attacker records in killmail data.'
      }
    case 2:
      switch (resolveChronicleBusinessLocale(locale)) {
        case 'zh-CN':
          return 'Chronicle 已索引 2 次锚定事件（网络节点或储存单元）。'
        case 'is':
          return 'Chronicle skráði 2 festingaratburði (nethnútur eða geymslueining).'
        default:
          return 'Chronicle indexed 2 anchor events (network_node or storage_unit).'
      }
    case 3:
      switch (resolveChronicleBusinessLocale(locale)) {
        case 'zh-CN':
          return 'Chronicle 已索引 15 次星门跃迁事件。'
        case 'is':
          return 'Chronicle skráði 15 stjörnuhliðarstökksatburði.'
        default:
          return 'Chronicle indexed 15 gate::jump events.'
      }
    default:
      return null
  }
}
