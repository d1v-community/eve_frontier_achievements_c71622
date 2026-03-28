import { isValidSuiAddress } from '@mysten/sui/utils'
import { ImageResponse } from 'next/og'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { getMockRouteSnapshot } from '~~/server/chronicle/mockRouteSnapshot'
import {
  buildFallbackWarriorShareCardModel,
  buildWarriorShareCardModel,
  OG_IMAGE_SIZE,
} from '~~/server/warrior/share'
import { WarriorShareImage } from '~~/server/warrior/shareCard'
import {
  isMockWarriorRoute,
  resolveMockClaimedSlugs,
  resolveWarriorNetwork,
  type WarriorRouteSearchParams,
} from '~~/warrior/share'

export const alt = 'Frontier Chronicle warrior profile card'
export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

interface ImageProps {
  params: Promise<{ walletAddress: string }>
  searchParams: Promise<WarriorRouteSearchParams>
}

export default async function Image({ params, searchParams }: ImageProps) {
  const { walletAddress } = await params
  const { network: rawNetwork, m: rawMock, claimed: rawClaimed } =
    await searchParams
  const network = resolveWarriorNetwork(rawNetwork)

  if (!isValidSuiAddress(walletAddress)) {
    const model = await buildFallbackWarriorShareCardModel(null, network)

    return new ImageResponse(
      <WarriorShareImage
        model={model}
        width={size.width}
        height={size.height}
      />,
      size
    )
  }

  try {
    const snapshot = isMockWarriorRoute(rawMock)
      ? getMockRouteSnapshot(
          walletAddress,
          network,
          resolveMockClaimedSlugs(rawClaimed)
        )
      : await getChronicleSnapshot(walletAddress, network)
    const model = await buildWarriorShareCardModel(snapshot, network)

    return new ImageResponse(
      <WarriorShareImage
        model={model}
        width={size.width}
        height={size.height}
      />,
      size
    )
  } catch {
    const model = await buildFallbackWarriorShareCardModel(
      walletAddress,
      network
    )

    return new ImageResponse(
      <WarriorShareImage
        model={model}
        width={size.width}
        height={size.height}
      />,
      size
    )
  }
}
