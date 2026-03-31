import type { Metadata } from 'next'
import {
  getMedalDefinitionBySlug,
  type MedalSlug,
  type MedalTone,
} from '~~/chronicle/config/medals'
import type { ChronicleMedalState, ChronicleSnapshot } from '~~/chronicle/types'
import { APP_NAME } from '~~/config/main'
import { toAbsoluteSiteUrl } from '~~/server/site'
import type { ENetwork } from '~~/types/ENetwork'
import { buildMedalImagePath, buildMedalSharePath } from '~~/warrior/share'
import { buildShareQrCodeDataUrl } from './qr'

export interface MedalShareCardTone {
  primary: string
  background: string
  border: string
  glow: string
  soft: string
}

export interface MedalShareCardModel {
  title: string
  titleZh: string | null
  rarity: string
  requirement: string
  proofLabel: string
  labels: {
    eyebrow: string
    evidence: string
    rarity: string
    requirement: string
    wallet: string
    unknownWallet: string
    character: string
    qrAlt: string
    qrHint: string
  }
  walletAddressShort: string
  characterId: string | null
  network: string
  statusLabel: string
  statusSummary: string
  shareUrl: string
  qrCodeDataUrl: string
  tone: MedalShareCardTone
}

const resolveLocale = (locale?: string) =>
  locale === 'zh-CN' || locale === 'is' ? locale : 'en'

const getMedalShareCopy = (locale?: string) => {
  switch (resolveLocale(locale)) {
    case 'zh-CN':
      return {
        fallbackTitle: '勋章快照',
        fallbackTitleZh: '勋章快照',
        unavailable: '暂不可用',
        fallbackRequirement: '当前无法提供这枚勋章快照。',
        fallbackProof: '当前无法加载这枚勋章的快照数据。',
        fallbackStatus: '快照不可用',
        fallbackSummary: 'Frontier Chronicle 现在无法验证这枚勋章快照。',
        metaFallbackTitle: `勋章快照 — ${APP_NAME}`,
        metaFallbackDescription: 'Frontier Chronicle 勋章快照',
        metaAlt: '勋章验证分享卡',
        statuses: {
          bound: {
            label: '链上绑定',
            summary: '这枚勋章当前已经绑定到该钱包的 Sui 地址上。',
          },
          verified: {
            label: '索引已验证',
            summary: 'Chronicle 已验证行为，但它还没有上链绑定。',
          },
          locked: {
            label: '未解锁',
            summary: 'Chronicle 还没有为这枚勋章索引到足够的边境证据。',
          },
        },
        labels: {
          eyebrow: 'Frontier Chronicle · 勋章验证',
          evidence: 'Chronicle 证据',
          rarity: '稀有度',
          requirement: '达成条件',
          wallet: '钱包',
          unknownWallet: '未知钱包',
          character: '角色',
          qrAlt: '勋章验证二维码',
          qrHint: '扫码打开勋章验证页',
        },
      }
    case 'is':
      return {
        fallbackTitle: 'Medal Snapshot',
        fallbackTitleZh: 'Medalíuskyndimynd',
        unavailable: 'Ófáanleg',
        fallbackRequirement: 'Þessi medalíuskyndimynd er ekki tiltæk í augnablikinu.',
        fallbackProof:
          'Ekki tókst að hlaða gögnum fyrir þessa medalíuskyndimynd núna.',
        fallbackStatus: 'SKYNDIMYND ÓFÁANLEG',
        fallbackSummary:
          'Frontier Chronicle gat ekki staðfest þessa medalíuskyndimynd í augnablikinu.',
        metaFallbackTitle: `Medal Snapshot — ${APP_NAME}`,
        metaFallbackDescription: 'Frontier Chronicle medalíuskyndimynd',
        metaAlt: 'medalíustaðfestingarspjald',
        statuses: {
          bound: {
            label: 'BUNDIÐ',
            summary: 'Þessi medalía er nú bundin við veskið á Sui.',
          },
          verified: {
            label: 'STAÐFEST',
            summary:
              'Chronicle hefur staðfest virknina, en hún er ekki enn bundin á keðju.',
          },
          locked: {
            label: 'LÆST',
            summary:
              'Chronicle hefur ekki enn skráð nægileg Frontier sönnunargögn fyrir þessa medalíu.',
          },
        },
        labels: {
          eyebrow: 'Frontier Chronicle · Medalíustaðfesting',
          evidence: 'Chronicle sönnun',
          rarity: 'Sjaldgæfni',
          requirement: 'Viðmið',
          wallet: 'Veski',
          unknownWallet: 'Óþekkt veski',
          character: 'Persóna',
          qrAlt: 'QR-kóði medalíustaðfestingar',
          qrHint: 'Skannaðu til að opna medalíustaðfestingarsíðuna',
        },
      }
    default:
      return {
        fallbackTitle: 'Medal Snapshot',
        fallbackTitleZh: 'Medal Snapshot',
        unavailable: 'Unavailable',
        fallbackRequirement: 'This medal snapshot is not currently available.',
        fallbackProof:
          'Snapshot data could not be loaded for this medal right now.',
        fallbackStatus: 'SNAPSHOT UNAVAILABLE',
        fallbackSummary:
          'Frontier Chronicle could not verify this medal snapshot right now.',
        metaFallbackTitle: `Medal Snapshot — ${APP_NAME}`,
        metaFallbackDescription: 'Frontier Chronicle medal snapshot',
        metaAlt: 'Medal verification share card',
        statuses: {
          bound: {
            label: 'CHAIN BOUND',
            summary: 'This medal is currently bound to the wallet on Sui.',
          },
          verified: {
            label: 'INDEX VERIFIED',
            summary:
              'Chronicle has verified the activity, but it is not bound on-chain yet.',
          },
          locked: {
            label: 'LOCKED',
            summary:
              'Chronicle has not indexed enough frontier evidence for this medal yet.',
          },
        },
        labels: {
          eyebrow: 'Frontier Chronicle · Medal Verification',
          evidence: 'Chronicle Evidence',
          rarity: 'Rarity',
          requirement: 'Requirement',
          wallet: 'Wallet',
          unknownWallet: 'Unknown Wallet',
          character: 'Character',
          qrAlt: 'Medal verification QR code',
          qrHint: 'Scan to open the medal verification page',
        },
      }
  }
}

export const MEDAL_OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

export const MEDAL_TWITTER_IMAGE_SIZE = {
  width: 1200,
  height: 600,
} as const

export const MEDAL_DISCORD_IMAGE_SIZE = {
  width: 1200,
  height: 675,
} as const

const TONE_MAP: Record<MedalTone, MedalShareCardTone> = {
  crimson: {
    primary: '#e63946',
    background: 'rgba(230,57,70,0.12)',
    border: 'rgba(230,57,70,0.28)',
    glow: 'rgba(230,57,70,0.2)',
    soft: 'rgba(230,57,70,0.06)',
  },
  azure: {
    primary: '#7c919d',
    background: 'rgba(124,145,157,0.12)',
    border: 'rgba(124,145,157,0.28)',
    glow: 'rgba(124,145,157,0.2)',
    soft: 'rgba(124,145,157,0.06)',
  },
  teal: {
    primary: '#4ecdc4',
    background: 'rgba(78,205,196,0.12)',
    border: 'rgba(78,205,196,0.28)',
    glow: 'rgba(78,205,196,0.2)',
    soft: 'rgba(78,205,196,0.06)',
  },
  amber: {
    primary: '#d9a441',
    background: 'rgba(217,164,65,0.12)',
    border: 'rgba(217,164,65,0.28)',
    glow: 'rgba(217,164,65,0.2)',
    soft: 'rgba(217,164,65,0.06)',
  },
  steel: {
    primary: '#8ea1ad',
    background: 'rgba(142,161,173,0.12)',
    border: 'rgba(142,161,173,0.28)',
    glow: 'rgba(142,161,173,0.2)',
    soft: 'rgba(142,161,173,0.06)',
  },
}

const formatWalletAddress = (
  walletAddress: string | null,
  fallback: string
) => {
  if (!walletAddress || walletAddress.length < 14) {
    return walletAddress || fallback
  }

  return `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
}

const getMedalStatus = (medal: ChronicleMedalState, locale?: string) => {
  const copy = getMedalShareCopy(locale)

  if (medal.claimed) {
    return copy.statuses.bound
  }

  if (medal.unlocked) {
    return copy.statuses.verified
  }

  return copy.statuses.locked
}

const truncateProof = (proof: string | null, locale?: string) => {
  const copy = getMedalShareCopy(locale)
  if (!proof || proof.trim().length === 0) {
    return copy.fallbackProof
  }

  return proof.length > 132 ? `${proof.slice(0, 129)}...` : proof
}

export const getSnapshotMedal = (
  snapshot: ChronicleSnapshot,
  slug: MedalSlug
) => snapshot.medals.find((medal) => medal.slug === slug) || null

export const buildMedalShareCardModel = async ({
  snapshot,
  walletAddress,
  network,
  slug,
  locale,
}: {
  snapshot: ChronicleSnapshot
  walletAddress: string
  network: ENetwork
  slug: MedalSlug
  locale?: string
}): Promise<MedalShareCardModel> => {
  const resolvedLocale = resolveLocale(locale)
  const copy = getMedalShareCopy(resolvedLocale)
  const medal = getSnapshotMedal(snapshot, slug)
  const definition = getMedalDefinitionBySlug(slug, resolvedLocale)

  if (!medal || !definition) {
    throw new Error('Medal snapshot could not be resolved')
  }

  const status = getMedalStatus(medal, locale)
  const shareUrl = toAbsoluteSiteUrl(
    buildMedalSharePath(walletAddress, slug, network, { locale })
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)

  return {
    title: definition.subtitle,
    titleZh: definition.title === definition.subtitle ? null : definition.title,
    rarity: definition.rarity,
    requirement: medal.requirement,
    proofLabel: truncateProof(medal.proof, locale),
    labels: copy.labels,
    walletAddressShort: formatWalletAddress(
      walletAddress,
      copy.labels.unknownWallet
    ),
    characterId: snapshot.profile.characterId,
    network: network.toUpperCase(),
    statusLabel: status.label,
    statusSummary: status.summary,
    shareUrl,
    qrCodeDataUrl,
    tone: TONE_MAP[definition.tone],
  }
}

export const buildFallbackMedalShareCardModel = async ({
  walletAddress,
  network,
  slug,
  locale,
}: {
  walletAddress: string | null
  network: ENetwork
  slug: string
  locale?: string
}): Promise<MedalShareCardModel> => {
  const resolvedLocale = resolveLocale(locale)
  const copy = getMedalShareCopy(resolvedLocale)
  const definition = getMedalDefinitionBySlug(slug, resolvedLocale)
  const shareUrl = toAbsoluteSiteUrl(
    walletAddress && definition
      ? buildMedalSharePath(walletAddress, definition.slug, network, { locale })
      : '/'
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)
  const tone = definition ? TONE_MAP[definition.tone] : TONE_MAP.steel

  return {
    title: definition?.subtitle || copy.fallbackTitle,
    titleZh:
      definition && definition.title !== definition.subtitle
        ? definition.title
        : definition
          ? null
          : copy.fallbackTitleZh,
    rarity: definition?.rarity || copy.unavailable,
    requirement: definition?.requirement || copy.fallbackRequirement,
    proofLabel: copy.fallbackProof,
    labels: copy.labels,
    walletAddressShort: formatWalletAddress(
      walletAddress,
      copy.labels.unknownWallet
    ),
    characterId: null,
    network: network.toUpperCase(),
    statusLabel: copy.fallbackStatus,
    statusSummary: copy.fallbackSummary,
    shareUrl,
    qrCodeDataUrl,
    tone,
  }
}

export const buildMedalPageMetadata = ({
  snapshot,
  walletAddress,
  network,
  slug,
  locale,
}: {
  snapshot: ChronicleSnapshot
  walletAddress: string
  network: ENetwork
  slug: MedalSlug
  locale?: string
}): Metadata => {
  const resolvedLocale = resolveLocale(locale)
  const copy = getMedalShareCopy(resolvedLocale)
  const medal = getSnapshotMedal(snapshot, slug)
  const definition = getMedalDefinitionBySlug(
    slug,
    resolvedLocale
  )

  if (!medal || !definition) {
    return {
      title: copy.metaFallbackTitle,
      description: copy.metaFallbackDescription,
    }
  }

  const status = getMedalStatus(medal, resolvedLocale)
  const canonicalUrl = toAbsoluteSiteUrl(
    buildMedalSharePath(walletAddress, slug, network, {
      locale: resolvedLocale,
    })
  )
  const ogImageUrl = toAbsoluteSiteUrl(
    buildMedalImagePath(walletAddress, slug, network, 'opengraph', {
      locale: resolvedLocale,
    })
  )
  const twitterImageUrl = toAbsoluteSiteUrl(
    buildMedalImagePath(walletAddress, slug, network, 'twitter', {
      locale: resolvedLocale,
    })
  )
  const shortWallet = formatWalletAddress(
    walletAddress,
    copy.labels.unknownWallet
  )
  const description =
    resolvedLocale === 'zh-CN'
      ? `${definition.subtitle} · ${status.label} · ${shortWallet} · Sui ${network.toUpperCase()}`
      : resolvedLocale === 'is'
        ? `${definition.subtitle} · ${status.label} · ${shortWallet} · Sui ${network.toUpperCase()}`
        : `${definition.subtitle} · ${status.label} · ${shortWallet} · Sui ${network.toUpperCase()}`

  return {
    title: `${definition.subtitle} — ${APP_NAME}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title:
        definition.title !== definition.subtitle
          ? `${definition.subtitle} (${definition.title}) — ${APP_NAME}`
          : `${definition.subtitle} — ${APP_NAME}`,
      description,
      siteName: APP_NAME,
      images: [
        {
          url: ogImageUrl,
          width: MEDAL_OG_IMAGE_SIZE.width,
          height: MEDAL_OG_IMAGE_SIZE.height,
          alt:
            resolvedLocale === 'zh-CN'
              ? `${definition.subtitle} 勋章验证分享卡`
              : resolvedLocale === 'is'
                ? `${definition.subtitle} medalíustaðfestingarspjald`
                : `${definition.subtitle} medal verification share card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${definition.subtitle} — ${APP_NAME}`,
      description,
      images: [twitterImageUrl],
    },
  }
}
