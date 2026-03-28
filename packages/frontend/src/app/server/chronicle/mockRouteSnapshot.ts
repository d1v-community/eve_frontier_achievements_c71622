import { buildMockSnapshot } from '~~/chronicle/mock/mockSnapshot'
import type { ChronicleSnapshot } from '~~/chronicle/types'
import type { MedalSlug } from '~~/chronicle/config/medals'
import type { ENetwork } from '~~/types/ENetwork'

export const getMockRouteSnapshot = (
  walletAddress: string,
  network: ENetwork,
  claimedSlugs: string[]
): ChronicleSnapshot => {
  const localClaimedSlugs = new Set(
    claimedSlugs.filter((slug): slug is MedalSlug => slug.length > 0)
  )

  return buildMockSnapshot(walletAddress, network, localClaimedSlugs)
}
