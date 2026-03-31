import type { ENetwork } from '~~/types/ENetwork'
import { resolveChronicleBusinessLocale } from '~~/chronicle/config/businessCopy'
import type { MedalDefinition, MedalSlug } from '../config/medals'
import type { ChronicleClaimTicket } from '../types'

const buildSeed = (...parts: Array<string | number | null | undefined>) =>
  parts
    .filter(
      (part): part is string | number => part !== null && part !== undefined
    )
    .map((part) => String(part))
    .join('::')

const hashSeed = (input: string) => {
  let hash = 0x811c9dc5

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }

  return hash >>> 0
}

const createHexStream = (seed: string, bytes: number) => {
  let state = hashSeed(seed) ^ 0x9e3779b9
  let output = ''

  while (output.length < bytes * 2) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    output += (state >>> 0).toString(16).padStart(8, '0')
  }

  return output.slice(0, bytes * 2)
}

const hexToBytes = (hex: string) =>
  Uint8Array.from(
    hex.match(/.{1,2}/g)?.map((chunk) => Number.parseInt(chunk, 16)) ?? []
  )

const encodeBase64 = (bytes: Uint8Array) => {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')

  if (typeof btoa === 'function') {
    return btoa(binary)
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }

  throw new Error('Base64 encoding is not available in this runtime')
}

const summarizeHex = (value: string, prefix = 12, suffix = 8) =>
  value.length <= prefix + suffix
    ? value
    : `${value.slice(0, prefix)}...${value.slice(-suffix)}`

export const createMockHex = (
  bytes: number,
  ...parts: Array<string | number | null | undefined>
) => createHexStream(buildSeed(...parts), bytes)

export const pickMockRange = (
  min: number,
  max: number,
  ...parts: Array<string | number | null | undefined>
) => {
  const span = max - min + 1
  const offset = hashSeed(buildSeed(...parts)) % span
  return min + offset
}

const pickMockItem = <T>(
  items: readonly T[],
  ...parts: Array<string | number | null | undefined>
) => items[pickMockRange(0, items.length - 1, ...parts)]

export const createMockObjectId = (
  ...parts: Array<string | number | null | undefined>
) => `0x${createMockHex(32, ...parts)}`

export const createMockDigest = (
  ...parts: Array<string | number | null | undefined>
) => `0x${createMockHex(32, ...parts)}`

export const createMockBase64 = (
  bytes: number,
  ...parts: Array<string | number | null | undefined>
) => encodeBase64(hexToBytes(createMockHex(bytes, ...parts)))

export const createMockProfileArtifacts = ({
  walletAddress,
  network,
}: {
  walletAddress: string
  network: ENetwork
}) => ({
  evePackageId: createMockObjectId('mock-profile', 'eve-package', network),
  characterId: createMockObjectId(
    'mock-profile',
    'character',
    walletAddress,
    network
  ),
  registryObjectId: createMockObjectId('mock-profile', 'registry', network),
})

export const createMockTemplateObjectId = ({
  walletAddress,
  network,
  slug,
}: {
  walletAddress: string
  network: ENetwork
  slug: MedalSlug
}) => createMockObjectId('mock-template', walletAddress, network, slug)

const buildProofSummary = ({
  slug,
  current,
  sampleWindow,
  walletAddress,
  network,
  locale,
}: {
  slug: MedalSlug
  current: number
  sampleWindow: number
  walletAddress: string
  network: ENetwork
  locale?: string
}) => {
  const traceSeed = [walletAddress, network, slug]
  const resolvedLocale = resolveChronicleBusinessLocale(locale)

  switch (slug) {
    case 'bloodlust-butcher': {
      const combatLane = createMockHex(
        3,
        ...traceSeed,
        'combat-lane'
      ).toUpperCase()
      const hullClass = pickMockItem(
        resolvedLocale === 'zh-CN'
          ? (['护卫舰', '驱逐舰', '炮艇', '劫掠编队'] as const)
          : resolvedLocale === 'is'
            ? (['freigáta', 'tundurspillir', 'byssuskip', 'ránssveit'] as const)
            : (['frigate', 'destroyer', 'gunship', 'raider wing'] as const),
        ...traceSeed,
        'hull-class'
      )
      if (resolvedLocale === 'zh-CN') {
        return `击杀航道 ${combatLane} 持续升温：在 ${sampleWindow} 页扫描中，共有 ${current} 条攻击者标签与 ${hullClass} 残骸遥测相互吻合`
      }
      if (resolvedLocale === 'is') {
        return `Killmail slóð ${combatLane} hélt sér heitri: ${current} árásarmerki pöruðust við braksgögn úr ${hullClass} yfir ${sampleWindow} síður`
      }
      return `Killmail lane ${combatLane} stayed hot: ${current} attacker tags matched against ${hullClass} wreck telemetry over ${sampleWindow} pages`
    }
    case 'void-pioneer': {
      const foothold = createMockHex(2, ...traceSeed, 'foothold').toUpperCase()
      const site = pickMockItem(
        resolvedLocale === 'zh-CN'
          ? (['边境中继站', '矿脉脊线', '冰层平台', '信标台地'] as const)
          : resolvedLocale === 'is'
            ? ([
                'jaðarboðstöð',
                'málmæðahryggur',
                'íssylla',
                'boðháslétta',
              ] as const)
            : ([
                'border relay',
                'ore spine',
                'ice shelf',
                'relay shelf',
              ] as const),
        ...traceSeed,
        'site'
      )
      if (current >= 1) {
        if (resolvedLocale === 'zh-CN') {
          return `前哨 ${foothold} 已落成：${site} 的网络节点锚点持续在线，并在 ${sampleWindow} 个基础设施扫描窗口内保持稳定`
        }
        if (resolvedLocale === 'is') {
          return `Bækistöð ${foothold} er virk: nethnútsfesting var innsigluð við ${site} og sást áfram í innviðaglugga ${sampleWindow}`
        }
        return `Foothold ${foothold} is live: a network node anchor sealed at ${site} and remained present through infra scan window ${sampleWindow}`
      }
      if (resolvedLocale === 'zh-CN') {
        return `前哨 ${foothold} 周边的 ${site} 已累计 ${current} 个储存锚点；${sampleWindow} 个基础设施扫描窗口都显示出稳定定居趋势`
      }
      if (resolvedLocale === 'is') {
        return `${current} geymslufestingar söfnuðust við bækistöð ${foothold} nálægt ${site}; innviðagluggi ${sampleWindow} sýnir skýra landnámsþróun`
      }
      return `${current} storage anchors stacked under foothold ${foothold} near ${site}; infra scan window ${sampleWindow} shows the settlement trend`
    }
    case 'galactic-courier': {
      const routeId = createMockHex(3, ...traceSeed, 'route').toUpperCase()
      const corridor = pickMockItem(
        resolvedLocale === 'zh-CN'
          ? (['南线航道', '余烬走廊', '矿运通道', '边境环线'] as const)
          : resolvedLocale === 'is'
            ? ([
                'suðurleiðin',
                'glóðagangurinn',
                'málmflutningsbrautin',
                'jaðarhringurinn',
              ] as const)
            : ([
                'southern pipe',
                'ember corridor',
                'ore shuttle lane',
                'frontier loop',
              ] as const),
        ...traceSeed,
        'corridor'
      )
      const cadenceMinutes = pickMockRange(3, 11, ...traceSeed, 'cadence')
      if (resolvedLocale === 'zh-CN') {
        return `航线 ${routeId} 保持稳定：${current} 次已验证星门跃迁串起了 ${corridor}，检查点之间的平均间隔约为 ${cadenceMinutes} 分钟`
      }
      if (resolvedLocale === 'is') {
        return `Leið ${routeId} hélt takti: ${current} staðfest stjörnuhliðarstökk tengdust yfir ${corridor}, með um ${cadenceMinutes} mínútur milli staðfestra punkta`
      }
      return `Route ${routeId} held steady: ${current} verified gate jumps stitched across the ${corridor}, average cadence ${cadenceMinutes}m between checkpoints`
    }
    case 'turret-sentry': {
      const sentryGrid = createMockHex(
        2,
        ...traceSeed,
        'sentry-grid'
      ).toUpperCase()
      const pattern = pickMockItem(
        resolvedLocale === 'zh-CN'
          ? ([
              '持续监视循环',
              '锁定追踪爆发',
              '拦截扫荡',
              '船体封锁轮转',
            ] as const)
          : resolvedLocale === 'is'
            ? ([
                'vöktunarlota',
                'læsa-og-fylgja hrina',
                'stöðvunarsveipur',
                'skrokkalokun',
              ] as const)
            : ([
                'overwatch cycle',
                'lock-and-track burst',
                'intercept sweep',
                'hull denial pass',
              ] as const),
        ...traceSeed,
        'pattern'
      )
      if (resolvedLocale === 'zh-CN') {
        return `防御网格 ${sentryGrid} 记录了 ${current} 次炮塔动作；在遥测批次 ${sampleWindow} 中，占主导的是“${pattern}”`
      }
      if (resolvedLocale === 'is') {
        return `Varnarnet ${sentryGrid} skráði ${current} turnaðgerðir; ríkjandi mynstrið í fjarkönnunarlotu ${sampleWindow} var ${pattern}`
      }
      return `Defense grid ${sentryGrid} logged ${current} turret actions; the dominant pattern was ${pattern} through telemetry batch ${sampleWindow}`
    }
    case 'assembly-pioneer': {
      const assemblyRack = createMockHex(
        2,
        ...traceSeed,
        'assembly-rack'
      ).toUpperCase()
      const productLine = pickMockItem(
        resolvedLocale === 'zh-CN'
          ? (['弹药批次', '维修框架', '中继部件', '燃料罐组'] as const)
          : resolvedLocale === 'is'
            ? ([
                'skotfæraruna',
                'viðgerðarrammi',
                'boðeining',
                'eldsneytishylki',
              ] as const)
            : ([
                'ammo batch',
                'repair frame',
                'relay component',
                'fuel canister',
              ] as const),
        ...traceSeed,
        'product-line'
      )
      if (resolvedLocale === 'zh-CN') {
        return `装配架 ${assemblyRack} 已被 ${current} 次索引交互预热；真正推动这条建造轨迹前进的是“${productLine}”产线吞吐`
      }
      if (resolvedLocale === 'is') {
        return `Samsetningargrind ${assemblyRack} hitnaði upp með ${current} skráðum aðgerðum; afköst ${productLine} ýttu þessari smíðaslóð áfram`
      }
      return `Assembly rack ${assemblyRack} warmed up with ${current} indexed interactions; ${productLine} throughput is what pushed this builder trace forward`
    }
    case 'turret-anchor': {
      const bastionSector = createMockHex(
        2,
        ...traceSeed,
        'bastion-sector'
      ).toUpperCase()
      const ridge = pickMockItem(
        resolvedLocale === 'zh-CN'
          ? (['小行星边缘', '星门外圈', '矿沟边带', '中继入口'] as const)
          : resolvedLocale === 'is'
            ? ([
                'smástirnabrún',
                'gáttarbarmur',
                'málmgróf',
                'boðnálgun',
              ] as const)
            : ([
                'asteroid lip',
                'gate rim',
                'ore trench',
                'relay approach',
              ] as const),
        ...traceSeed,
        'ridge'
      )
      if (resolvedLocale === 'zh-CN') {
        return `堡垒扇区 ${bastionSector} 在 ${ridge} 沿线出现了 ${current} 次硬点锚定提交；这些是固定火力点，不是临时路过`
      }
      if (resolvedLocale === 'is') {
        return `Bastion geiri ${bastionSector} sýnir ${current} staðfestar harðpunktafestingar meðfram ${ridge}; þetta eru fastar varnarstöður, ekki tímabundnar ferðir`
      }
      return `Bastion sector ${bastionSector} shows ${current} hardpoint anchor commits along the ${ridge}; these are fixed emplacements, not transient passes`
    }
    case 'ssu-trader': {
      const manifest = createMockHex(2, ...traceSeed, 'manifest').toUpperCase()
      const cargoBand = pickMockItem(
        resolvedLocale === 'zh-CN'
          ? (['矿石', '燃料电池', '装配零件', '残骸回收品'] as const)
          : resolvedLocale === 'is'
            ? ([
                'málmur',
                'eldsneytisfrumur',
                'samsetningarhlutar',
                'endurheimt hráefni',
              ] as const)
            : (['ore', 'fuel cells', 'assembly parts', 'salvage'] as const),
        ...traceSeed,
        'cargo-band'
      )
      if (resolvedLocale === 'zh-CN') {
        return `货单 ${manifest} 已对齐 ${current} 次 SSU 出入库动作；在物流样本 ${sampleWindow} 中，保留下来的主要是“${cargoBand}”货物签名`
      }
      if (resolvedLocale === 'is') {
        return `Manifest ${manifest} jafnaði ${current} SSU inn- og útflæði; ríkjandi farmsnið í flutningssýni ${sampleWindow} var ${cargoBand}`
      }
      return `Manifest ${manifest} reconciled ${current} SSU in/out movements with ${cargoBand} cargo signatures preserved through logistics sample ${sampleWindow}`
    }
    case 'fuel-feeder': {
      const nodeCluster = createMockHex(
        2,
        ...traceSeed,
        'node-cluster'
      ).toUpperCase()
      const reserve = pickMockRange(9, 31, ...traceSeed, 'reserve-hours')
      if (resolvedLocale === 'zh-CN') {
        return `节点簇 ${nodeCluster} 已接收 ${current} 次燃料注入；按维护 trace ${sampleWindow} 估算，最近一次补给后的可用余量约为 ${reserve} 小时`
      }
      if (resolvedLocale === 'is') {
        return `Nethnútsklasi ${nodeCluster} tók við ${current} eldsneytisáfyllingum; áætlaður varaforði eftir síðustu áfyllingu er um ${reserve} klst. í viðhaldsslóð ${sampleWindow}`
      }
      return `Node cluster ${nodeCluster} accepted ${current} fuel injections; projected reserve after the last refill sits near ${reserve}h in maintenance trace ${sampleWindow}`
    }
    default:
      if (resolvedLocale === 'zh-CN') {
        return `${sampleWindow} 页扫描中确认了 ${current} 条已索引活动事件`
      }
      if (resolvedLocale === 'is') {
        return `${current} skráðir atburðir staðfestust yfir ${sampleWindow} skannasíður`
      }
      return `${current} indexed activity events confirmed across ${sampleWindow} scan pages`
  }
}

export const createMockMedalProof = ({
  walletAddress,
  network,
  definition,
  current,
  target,
  claimed,
  locale,
}: {
  walletAddress: string
  network: ENetwork
  definition: MedalDefinition
  current: number
  target: number
  claimed: boolean
  locale?: string
}) => {
  const resolvedLocale = resolveChronicleBusinessLocale(locale)
  const digest = createMockDigest(
    'mock-proof',
    walletAddress,
    network,
    definition.slug,
    current,
    target
  )
  const sampleWindow = pickMockRange(
    3,
    12,
    'mock-proof-window',
    walletAddress,
    network,
    definition.slug
  )
  const traceTag = createMockHex(
    5,
    'mock-proof-trace',
    walletAddress,
    network,
    definition.slug
  ).toUpperCase()
  const settlement =
    resolvedLocale === 'zh-CN'
      ? claimed
        ? '凭证已固化'
        : '门槛已验证'
      : resolvedLocale === 'is'
        ? claimed
          ? 'færsla innsigluð'
          : 'viðmið staðfest'
        : claimed
          ? 'receipt settled'
          : 'threshold verified'
  const traceLabel =
    resolvedLocale === 'zh-CN'
      ? '轨迹'
      : resolvedLocale === 'is'
        ? 'ferill'
        : 'Trace'
  const digestLabel =
    resolvedLocale === 'zh-CN'
      ? '摘要'
      : resolvedLocale === 'is'
        ? 'útdráttur'
        : 'digest'

  return `${traceLabel} ${traceTag} · ${buildProofSummary({
    slug: definition.slug,
    current,
    sampleWindow,
    walletAddress,
    network,
    locale: resolvedLocale,
  })} · ${settlement} · ${digestLabel} ${summarizeHex(digest, 14, 10)}`
}

export const createMockClaimTicket = ({
  walletAddress,
  network,
  definition,
  templateObjectId,
  issuedAtMs = Date.now() - 90_000,
  ttlMs = 12 * 60 * 1000,
}: {
  walletAddress: string
  network: ENetwork
  definition: MedalDefinition
  templateObjectId: string
  issuedAtMs?: number
  ttlMs?: number
}): ChronicleClaimTicket => {
  const templateVersion = pickMockRange(
    1,
    3,
    'mock-claim-version',
    walletAddress,
    network,
    definition.slug
  )
  const evidenceId = createMockHex(
    10,
    'mock-claim-evidence',
    walletAddress,
    network,
    definition.slug
  )

  return {
    templateObjectId,
    templateVersion,
    proofDigestBase64: createMockBase64(
      32,
      'mock-claim-proof-digest',
      walletAddress,
      network,
      definition.slug
    ),
    evidenceUri: `https://frontier-chronicle.vercel.app/mock/evidence/${network}/${definition.slug}/${evidenceId}`,
    issuedAtMs: String(issuedAtMs),
    deadlineMs: String(issuedAtMs + ttlMs),
    nonceBase64: createMockBase64(
      16,
      'mock-claim-nonce',
      walletAddress,
      network,
      definition.slug
    ),
    signerPublicKeyBase64: createMockBase64(
      32,
      'mock-claim-signer',
      walletAddress,
      network,
      definition.slug
    ),
    signatureBase64: createMockBase64(
      64,
      'mock-claim-signature',
      walletAddress,
      network,
      definition.slug
    ),
  }
}
