import { isValidSuiAddress } from '@mysten/sui/utils'
import { ImageResponse } from 'next/og'
import { getLocale } from 'next-intl/server'
import { getMedalDefinitionBySlug } from '~~/chronicle/config/medals'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { getMockRouteSnapshot } from '~~/server/chronicle/mockRouteSnapshot'
import {
  buildFallbackMedalShareCardModel,
  buildMedalShareCardModel,
  MEDAL_DISCORD_IMAGE_SIZE,
} from '~~/server/warrior/medalShare'
import { MedalShareImage } from '~~/server/warrior/medalShareCard'
import {
  isMockWarriorRoute,
  resolveMockClaimedSlugs,
  resolveWarriorNetwork,
} from '~~/warrior/share'

export const dynamic = 'force-dynamic'

const size = MEDAL_DISCORD_IMAGE_SIZE

export async function GET(
  request: Request,
  { params }: { params: Promise<{ walletAddress: string; slug: string }> }
) {
  const locale = await getLocale()
  const { walletAddress, slug } = await params
  const { searchParams } = new URL(request.url)
  const network = resolveWarriorNetwork(
    searchParams.get('network') ?? undefined
  )
  const isMockMode = isMockWarriorRoute(searchParams.get('m') ?? undefined)
  const claimedSlugs = resolveMockClaimedSlugs(
    searchParams.get('claimed') ?? undefined
  )
  const definition = getMedalDefinitionBySlug(slug, locale)

  if (!isValidSuiAddress(walletAddress) || !definition) {
    const model = await buildFallbackMedalShareCardModel({
      walletAddress: isValidSuiAddress(walletAddress) ? walletAddress : null,
      network,
      slug,
      locale,
    })

    return new ImageResponse(
      <MedalShareImage model={model} width={size.width} height={size.height} />,
      size
    )
  }

  try {
    const snapshot = isMockMode
      ? getMockRouteSnapshot(walletAddress, network, claimedSlugs, locale)
      : await getChronicleSnapshot(walletAddress, network, locale)
    const model = await buildMedalShareCardModel({
      snapshot,
      walletAddress,
      network,
      slug: definition.slug,
      locale,
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
      locale,
    })

    return new ImageResponse(
      <MedalShareImage model={model} width={size.width} height={size.height} />,
      size
    )
  }
}
