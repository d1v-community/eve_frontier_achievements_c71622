import { isValidSuiAddress } from '@mysten/sui/utils'
import { ImageResponse } from 'next/og'
import { getLocale } from 'next-intl/server'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { getMockRouteSnapshot } from '~~/server/chronicle/mockRouteSnapshot'
import {
  buildFallbackWarriorShareCardModel,
  buildWarriorShareCardModel,
  TWITTER_IMAGE_SIZE,
} from '~~/server/warrior/share'
import { WarriorShareImage } from '~~/server/warrior/shareCard'
import {
  isMockWarriorRoute,
  resolveMockClaimedSlugs,
  resolveWarriorNetwork,
} from '~~/warrior/share'

export const dynamic = 'force-dynamic'

const size = TWITTER_IMAGE_SIZE

export async function GET(
  request: Request,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  const locale = await getLocale()
  const { walletAddress } = await params
  const { searchParams } = new URL(request.url)
  const network = resolveWarriorNetwork(
    searchParams.get('network') ?? undefined
  )
  const isMockMode = isMockWarriorRoute(searchParams.get('m') ?? undefined)
  const claimedSlugs = resolveMockClaimedSlugs(
    searchParams.get('claimed') ?? undefined
  )

  if (!isValidSuiAddress(walletAddress)) {
    const model = await buildFallbackWarriorShareCardModel(
      null,
      network,
      locale
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

  try {
    const snapshot = isMockMode
      ? getMockRouteSnapshot(walletAddress, network, claimedSlugs, locale)
      : await getChronicleSnapshot(walletAddress, network, locale)
    const model = await buildWarriorShareCardModel(snapshot, network, locale)

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
      network,
      locale
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
