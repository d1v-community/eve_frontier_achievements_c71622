import { isValidSuiAddress } from '@mysten/sui/utils'
import { ImageResponse } from 'next/og'
import { getMedalDefinitionBySlug } from '~~/chronicle/config/medals'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { getMockRouteSnapshot } from '~~/server/chronicle/mockRouteSnapshot'
import {
  buildFallbackMedalShareCardModel,
  buildMedalShareCardModel,
  MEDAL_OG_IMAGE_SIZE,
} from '~~/server/warrior/medalShare'
import { MedalShareImage } from '~~/server/warrior/medalShareCard'
import {
  type WarriorRouteSearchParams,
  isMockWarriorRoute,
  resolveMockClaimedSlugs,
  resolveWarriorNetwork,
} from '~~/warrior/share'

export const alt = 'Frontier Chronicle medal verification card'
export const size = MEDAL_OG_IMAGE_SIZE
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

interface ImageProps {
  params: Promise<{ walletAddress: string; slug: string }>
  searchParams: Promise<WarriorRouteSearchParams>
}

export default async function Image({ params, searchParams }: ImageProps) {
  const { walletAddress, slug } = await params
  const { network: rawNetwork, m: rawMock, claimed: rawClaimed } =
    await searchParams
  const network = resolveWarriorNetwork(rawNetwork)
  const definition = getMedalDefinitionBySlug(slug)

  if (!isValidSuiAddress(walletAddress) || !definition) {
    const model = await buildFallbackMedalShareCardModel({
      walletAddress: isValidSuiAddress(walletAddress) ? walletAddress : null,
      network,
      slug,
    })

    return new ImageResponse(
      <MedalShareImage model={model} width={size.width} height={size.height} />,
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
    const model = await buildMedalShareCardModel({
      snapshot,
      walletAddress,
      network,
      slug: definition.slug,
    })

    return new ImageResponse(
      <MedalShareImage model={model} width={size.width} height={size.height} />,
      size
    )
  } catch {
    const model = await buildFallbackMedalShareCardModel({
      walletAddress,
      network,
      slug: definition.slug,
    })

    return new ImageResponse(
      <MedalShareImage model={model} width={size.width} height={size.height} />,
      size
    )
  }
}
