import type { MedalSlug } from '~~/chronicle/config/medals'
import { ENetwork } from '~~/types/ENetwork'

export interface WarriorRouteSearchParams {
  network?: string | string[] | undefined
  m?: string | string[] | undefined
  claimed?: string | string[] | undefined
}

interface WarriorRouteOptions {
  mock?: boolean
  claimed?: string[]
}

const normalizeStringParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const normalizeStringListParam = (value: string | string[] | undefined) => {
  const normalized = Array.isArray(value) ? value.join(',') : value

  if (!normalized) {
    return []
  }

  return normalized
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const buildWarriorQueryString = (
  network: ENetwork,
  options?: WarriorRouteOptions
) => {
  const params = new URLSearchParams({ network })

  if (options?.mock) {
    params.set('m', '1')
  }

  if (options?.claimed?.length) {
    params.set('claimed', options.claimed.join(','))
  }

  return params.toString()
}

export const resolveWarriorNetwork = (
  rawNetwork: string | string[] | undefined
): ENetwork => {
  const network = normalizeStringParam(rawNetwork)?.toLowerCase()
  const validNetworks = Object.values(ENetwork)
  return validNetworks.includes(network as ENetwork)
    ? (network as ENetwork)
    : ENetwork.TESTNET
}

export const isMockWarriorRoute = (
  rawMock: string | string[] | undefined
) => normalizeStringParam(rawMock) === '1'

export const resolveMockClaimedSlugs = (
  rawClaimed: string | string[] | undefined
) => normalizeStringListParam(rawClaimed)

export const buildWarriorSharePath = (
  walletAddress: string,
  network: ENetwork,
  options?: WarriorRouteOptions
) => `/warrior/${walletAddress}?${buildWarriorQueryString(network, options)}`

export const buildWarriorImagePath = (
  walletAddress: string,
  network: ENetwork,
  variant: 'opengraph' | 'twitter',
  options?: WarriorRouteOptions
) =>
  `/warrior/${walletAddress}/${variant}-image?${buildWarriorQueryString(network, options)}`

export const buildMedalSharePath = (
  walletAddress: string,
  slug: MedalSlug,
  network: ENetwork,
  options?: WarriorRouteOptions
) =>
  `/warrior/${walletAddress}/medals/${slug}?${buildWarriorQueryString(network, options)}`

export const buildMedalImagePath = (
  walletAddress: string,
  slug: MedalSlug,
  network: ENetwork,
  variant: 'opengraph' | 'twitter' | 'discord',
  options?: WarriorRouteOptions
) => {
  if (variant === 'discord') {
    return `/warrior/${walletAddress}/medals/${slug}/discord-image?${buildWarriorQueryString(network, options)}`
  }
  return `/warrior/${walletAddress}/medals/${slug}/${variant}-image?${buildWarriorQueryString(network, options)}`
}

// ─── Per-medal share text ─────────────────────────────────────────────────────
// Fits comfortably within X's 280-char limit after the URL is appended.

const MEDAL_SHARE_TEXT: Record<MedalSlug, string> = {
  'bloodlust-butcher':
    '5 confirmed kills, chain-indexed. The Bloodlust Butcher medal is now soul-bound to my wallet — permanent, verified, indelible. #EVEFrontier #FrontierChronicle',
  'void-pioneer':
    'Infrastructure deployed in the void and recorded on Sui forever. Void Pioneer — the Frontier remembers who built it first. #EVEFrontier #FrontierChronicle',
  'galactic-courier':
    '10 gate jumps, all indexed. The supply lines that keep Frontier civilizations running — now chain-bound as the Galactic Courier medal. #EVEFrontier #FrontierChronicle',
  'turret-sentry':
    'Guns deployed, perimeter locked. Turret Sentry is now soul-bound on Sui — proof I was holding this ground before the front line moved. #EVEFrontier #FrontierChronicle',
  'assembly-pioneer':
    'Smart Assembly online. Three on-chain infrastructure interactions, now immortalized as the Assembly Pioneer medal on Sui. #EVEFrontier #FrontierChronicle',
  'turret-anchor':
    'Turrets anchored. Territory marked. The Turret Anchor medal is soulbound — a verifiable claim staked permanently in the Frontier. #EVEFrontier #FrontierChronicle',
  'ssu-trader':
    '5 SSU trade operations, chain-indexed. Markets keep moving because of haulers like me. SSU Trader medal — soul-bound on Sui. #EVEFrontier #FrontierChronicle',
  'fuel-feeder':
    'Network nodes stay live because someone fuels them. 5 fuel ops recorded. Fuel Feeder medal now bound on-chain. #EVEFrontier #FrontierChronicle',
}

/**
 * Returns a compelling, platform-ready share text for the given medal slug.
 * Falls back to a generic template if the slug is unknown.
 */
export const generateMedalShareText = (
  slug: MedalSlug,
  subtitle: string
): string =>
  MEDAL_SHARE_TEXT[slug] ??
  `${subtitle} is chain-bound in Frontier Chronicle on Sui. #EVEFrontier #FrontierChronicle`
