import { isValidSuiAddress } from '@mysten/sui/utils'
import { ImageResponse } from 'next/og'
import { getMedalDefinitionBySlug } from '~~/chronicle/config/medals'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import {
  buildFallbackMedalShareCardModel,
  buildMedalShareCardModel,
  MEDAL_DISCORD_IMAGE_SIZE,
} from '~~/server/warrior/medalShare'
import { MedalShareImage } from '~~/server/warrior/medalShareCard'
import { resolveWarriorNetwork } from '~~/warrior/share'

export const dynamic = 'force-dynamic'

const size = MEDAL_DISCORD_IMAGE_SIZE

export async function GET(
  request: Request,
  { params }: { params: Promise<{ walletAddress: string; slug: string }> }
) {
  const { walletAddress, slug } = await params
  const { searchParams } = new URL(request.url)
  const network = resolveWarriorNetwork(searchParams.get('network') ?? undefined)
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
    const snapshot = await getChronicleSnapshot(walletAddress, network)
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
