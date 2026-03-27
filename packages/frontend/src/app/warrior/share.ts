import type { MedalSlug } from '~~/chronicle/config/medals'
import { ENetwork } from '~~/types/ENetwork'

export interface WarriorRouteSearchParams {
  network?: string | string[] | undefined
}

const normalizeStringParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export const resolveWarriorNetwork = (
  rawNetwork: string | string[] | undefined
): ENetwork => {
  const network = normalizeStringParam(rawNetwork)?.toLowerCase()
  const validNetworks = Object.values(ENetwork)
  return validNetworks.includes(network as ENetwork)
    ? (network as ENetwork)
    : ENetwork.TESTNET
}

export const buildWarriorSharePath = (
  walletAddress: string,
  network: ENetwork
) => `/warrior/${walletAddress}?network=${network}`

export const buildWarriorImagePath = (
  walletAddress: string,
  network: ENetwork,
  variant: 'opengraph' | 'twitter'
) => `/warrior/${walletAddress}/${variant}-image?network=${network}`

export const buildMedalSharePath = (
  walletAddress: string,
  slug: MedalSlug,
  network: ENetwork
) => `/warrior/${walletAddress}/medals/${slug}?network=${network}`

export const buildMedalImagePath = (
  walletAddress: string,
  slug: MedalSlug,
  network: ENetwork,
  variant: 'opengraph' | 'twitter' | 'discord'
) => {
  if (variant === 'discord') {
    return `/warrior/${walletAddress}/medals/${slug}/discord-image?network=${network}`
  }
  return `/warrior/${walletAddress}/medals/${slug}/${variant}-image?network=${network}`
}
