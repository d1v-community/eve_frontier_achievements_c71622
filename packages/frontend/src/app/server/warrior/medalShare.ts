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
  titleZh: string
  rarity: string
  requirement: string
  proofLabel: string
  walletAddressShort: string
  characterId: string | null
  network: string
  statusLabel: string
  statusSummary: string
  shareUrl: string
  qrCodeDataUrl: string
  tone: MedalShareCardTone
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

const formatWalletAddress = (walletAddress: string | null) => {
  if (!walletAddress || walletAddress.length < 14) {
    return walletAddress || 'Unknown Wallet'
  }

  return `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
}

const getMedalStatus = (medal: ChronicleMedalState) => {
  if (medal.claimed) {
    return {
      label: 'CHAIN BOUND',
      summary: 'This medal is currently bound to the wallet on Sui.',
    }
  }

  if (medal.unlocked) {
    return {
      label: 'INDEX VERIFIED',
      summary:
        'Chronicle has verified the activity, but it is not bound on-chain yet.',
    }
  }

  return {
    label: 'LOCKED',
    summary:
      'Chronicle has not indexed enough frontier evidence for this medal yet.',
  }
}

const truncateProof = (proof: string | null) => {
  if (!proof || proof.trim().length === 0) {
    return 'On-chain ownership verification is unavailable for this medal snapshot.'
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
}: {
  snapshot: ChronicleSnapshot
  walletAddress: string
  network: ENetwork
  slug: MedalSlug
}): Promise<MedalShareCardModel> => {
  const medal = getSnapshotMedal(snapshot, slug)
  const definition = getMedalDefinitionBySlug(slug)

  if (!medal || !definition) {
    throw new Error('Medal snapshot could not be resolved')
  }

  const status = getMedalStatus(medal)
  const shareUrl = toAbsoluteSiteUrl(
    buildMedalSharePath(walletAddress, slug, network)
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)

  return {
    title: definition.subtitle,
    titleZh: definition.title,
    rarity: definition.rarity,
    requirement: definition.requirement,
    proofLabel: truncateProof(medal.proof),
    walletAddressShort: formatWalletAddress(walletAddress),
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
}: {
  walletAddress: string | null
  network: ENetwork
  slug: string
}): Promise<MedalShareCardModel> => {
  const definition = getMedalDefinitionBySlug(slug)
  const shareUrl = toAbsoluteSiteUrl(
    walletAddress && definition
      ? buildMedalSharePath(walletAddress, definition.slug, network)
      : '/'
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)
  const tone = definition ? TONE_MAP[definition.tone] : TONE_MAP.steel

  return {
    title: definition?.subtitle || 'Medal Snapshot',
    titleZh: definition?.title || '勋章快照',
    rarity: definition?.rarity || 'Unavailable',
    requirement:
      definition?.requirement ||
      'This medal snapshot is not currently available.',
    proofLabel: 'Snapshot data could not be loaded for this medal right now.',
    walletAddressShort: formatWalletAddress(walletAddress),
    characterId: null,
    network: network.toUpperCase(),
    statusLabel: 'SNAPSHOT UNAVAILABLE',
    statusSummary:
      'Frontier Chronicle could not verify this medal snapshot right now.',
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
}: {
  snapshot: ChronicleSnapshot
  walletAddress: string
  network: ENetwork
  slug: MedalSlug
}): Metadata => {
  const medal = getSnapshotMedal(snapshot, slug)
  const definition = getMedalDefinitionBySlug(slug)

  if (!medal || !definition) {
    return {
      title: `Medal Snapshot — ${APP_NAME}`,
      description: 'Frontier Chronicle medal snapshot',
    }
  }

  const status = getMedalStatus(medal)
  const canonicalUrl = toAbsoluteSiteUrl(
    buildMedalSharePath(walletAddress, slug, network)
  )
  const ogImageUrl = toAbsoluteSiteUrl(
    buildMedalImagePath(walletAddress, slug, network, 'opengraph')
  )
  const twitterImageUrl = toAbsoluteSiteUrl(
    buildMedalImagePath(walletAddress, slug, network, 'twitter')
  )
  const shortWallet = formatWalletAddress(walletAddress)
  const description = `${definition.subtitle} · ${status.label} · ${shortWallet} · Sui ${network.toUpperCase()}`

  return {
    title: `${definition.subtitle} — ${APP_NAME}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `${definition.subtitle} (${definition.title}) — ${APP_NAME}`,
      description,
      siteName: APP_NAME,
      images: [
        {
          url: ogImageUrl,
          width: MEDAL_OG_IMAGE_SIZE.width,
          height: MEDAL_OG_IMAGE_SIZE.height,
          alt: `${definition.subtitle} medal verification card`,
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
