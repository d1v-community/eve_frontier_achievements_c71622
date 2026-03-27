import type { Metadata } from 'next'
import type {
  ChronicleMedalState,
  ChronicleSnapshot,
  RankTone,
} from '~~/chronicle/types'
import { APP_NAME } from '~~/config/main'
import { toAbsoluteSiteUrl } from '~~/server/site'
import { ENetwork } from '~~/types/ENetwork'
import { buildWarriorImagePath, buildWarriorSharePath } from '~~/warrior/share'
import { buildShareQrCodeDataUrl } from './qr'

export interface WarriorShareCardTone {
  primary: string
  background: string
  border: string
  glow: string
}

export interface WarriorShareMedalPreview {
  slug: string
  title: string
  subtitle: string
  status: 'BOUND' | 'VERIFIED' | 'LOCKED'
  color: string
}

export interface WarriorShareCardModel {
  title: string
  titleZh: string
  description: string
  shareUrl: string
  qrCodeDataUrl: string
  network: string
  walletAddress: string | null
  walletAddressShort: string
  characterId: string | null
  score: number
  scoreLabel: string
  medalsLabel: string
  scanLabel: string
  previewMedals: WarriorShareMedalPreview[]
  hasFullSet: boolean
  tone: WarriorShareCardTone
}

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

export const TWITTER_IMAGE_SIZE = {
  width: 1200,
  height: 600,
} as const

const RANK_TONE_MAP: Record<RankTone, WarriorShareCardTone> = {
  steel: {
    primary: '#8ea1ad',
    background: 'rgba(142,161,173,0.12)',
    border: 'rgba(142,161,173,0.28)',
    glow: 'rgba(142,161,173,0.24)',
  },
  amber: {
    primary: '#d9a441',
    background: 'rgba(217,164,65,0.12)',
    border: 'rgba(217,164,65,0.28)',
    glow: 'rgba(217,164,65,0.24)',
  },
  azure: {
    primary: '#7c919d',
    background: 'rgba(124,145,157,0.12)',
    border: 'rgba(124,145,157,0.28)',
    glow: 'rgba(124,145,157,0.24)',
  },
  martian: {
    primary: '#f0642f',
    background: 'rgba(240,100,47,0.12)',
    border: 'rgba(240,100,47,0.28)',
    glow: 'rgba(240,100,47,0.26)',
  },
  crimson: {
    primary: '#e63946',
    background: 'rgba(230,57,70,0.12)',
    border: 'rgba(230,57,70,0.28)',
    glow: 'rgba(230,57,70,0.24)',
  },
}

const MEDAL_COLOR_MAP: Record<string, string> = {
  'bloodlust-butcher': '#e63946',
  'void-pioneer': '#7c919d',
  'galactic-courier': '#4ecdc4',
  'turret-sentry': '#d9a441',
  'assembly-pioneer': '#8ea1ad',
  'turret-anchor': '#d9a441',
  'ssu-trader': '#4ecdc4',
  'fuel-feeder': '#8ea1ad',
}

const formatWalletAddress = (walletAddress: string | null) => {
  if (!walletAddress || walletAddress.length < 14)
    return walletAddress || 'Unknown Wallet'
  return `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
}

const getPreviewMedals = (
  medals: ChronicleMedalState[]
): WarriorShareMedalPreview[] => {
  const rankedMedals = [...medals].sort((left, right) => {
    const leftScore = Number(left.claimed) * 2 + Number(left.unlocked)
    const rightScore = Number(right.claimed) * 2 + Number(right.unlocked)
    return rightScore - leftScore
  })

  return rankedMedals.slice(0, 3).map((medal) => ({
    slug: medal.slug,
    title: medal.title,
    subtitle: medal.subtitle,
    status: medal.claimed ? 'BOUND' : medal.unlocked ? 'VERIFIED' : 'LOCKED',
    color: MEDAL_COLOR_MAP[medal.slug] || '#8ea1ad',
  }))
}

export const buildWarriorShareCardModel = async (
  snapshot: ChronicleSnapshot,
  network: ENetwork
): Promise<WarriorShareCardModel> => {
  const { medals, profile, warriorScore } = snapshot
  const { rank } = warriorScore
  const medalCount = `${warriorScore.claimedMedalCount} / ${medals.length}`
  const shareUrl = toAbsoluteSiteUrl(
    buildWarriorSharePath(profile.walletAddress, network)
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)

  return {
    title: rank.title,
    titleZh: rank.titleZh,
    description: rank.description,
    shareUrl,
    qrCodeDataUrl,
    network: network.toUpperCase(),
    walletAddress: profile.walletAddress,
    walletAddressShort: formatWalletAddress(profile.walletAddress),
    characterId: profile.characterId,
    score: warriorScore.displayScore,
    scoreLabel: `${warriorScore.displayScore.toLocaleString()} / 10,000`,
    medalsLabel: warriorScore.hasFullSet
      ? `${medalCount} · FULL SET`
      : medalCount,
    scanLabel:
      profile.scanMode === 'authenticated' ? 'Deep Scan' : 'Preview Scan',
    previewMedals: getPreviewMedals(medals),
    hasFullSet: warriorScore.hasFullSet,
    tone: RANK_TONE_MAP[rank.tone] || RANK_TONE_MAP.steel,
  }
}

export const buildFallbackWarriorShareCardModel = async (
  walletAddress: string | null,
  network: ENetwork
): Promise<WarriorShareCardModel> => {
  const shareUrl = toAbsoluteSiteUrl(
    walletAddress ? buildWarriorSharePath(walletAddress, network) : '/'
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)

  return {
    title: 'Warrior Profile',
    titleZh: '边境战士档案',
    description: 'Chain-verified Frontier identity is loading or unavailable.',
    shareUrl,
    qrCodeDataUrl,
    network: network.toUpperCase(),
    walletAddress,
    walletAddressShort: formatWalletAddress(walletAddress),
    characterId: null,
    score: 0,
    scoreLabel: '0 / 10,000',
    medalsLabel: '0 / 8',
    scanLabel: 'Snapshot Unavailable',
    previewMedals: [],
    hasFullSet: false,
    tone: RANK_TONE_MAP.steel,
  }
}

export const buildWarriorPageMetadata = ({
  snapshot,
  walletAddress,
  network,
}: {
  snapshot: ChronicleSnapshot
  walletAddress: string
  network: ENetwork
}): Metadata => {
  const { rank, displayScore, claimedMedalCount } = snapshot.warriorScore
  const shortWallet = formatWalletAddress(walletAddress)
  const canonicalPath = buildWarriorSharePath(walletAddress, network)
  const canonicalUrl = toAbsoluteSiteUrl(canonicalPath)
  const ogImageUrl = toAbsoluteSiteUrl(
    buildWarriorImagePath(walletAddress, network, 'opengraph')
  )
  const twitterImageUrl = toAbsoluteSiteUrl(
    buildWarriorImagePath(walletAddress, network, 'twitter')
  )

  return {
    title: `${rank.title} — ${APP_NAME}`,
    description: `Combat Score: ${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} Medal${claimedMedalCount !== 1 ? 's' : ''} Bound · ${shortWallet}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `${rank.title} (${rank.titleZh}) — ${APP_NAME}`,
      description: `Combat Score: ${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} Medal${claimedMedalCount !== 1 ? 's' : ''} Bound on Sui ${network.toUpperCase()}`,
      siteName: APP_NAME,
      images: [
        {
          url: ogImageUrl,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: `${rank.title} warrior profile card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${rank.title} — ${APP_NAME}`,
      description: `Combat Score: ${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} Medals Bound · Verified on Sui ${network.toUpperCase()}`,
      images: [twitterImageUrl],
    },
  }
}
