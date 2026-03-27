import { isValidSuiAddress } from '@mysten/sui/utils'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMedalDefinitionBySlug } from '~~/chronicle/config/medals'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import {
  buildMedalPageMetadata,
  getSnapshotMedal,
} from '~~/server/warrior/medalShare'
import { type WarriorRouteSearchParams, resolveWarriorNetwork } from '~~/warrior/share'
import MedalPageClient from './MedalPageClient'

interface PageProps {
  params: Promise<{ walletAddress: string; slug: string }>
  searchParams: Promise<WarriorRouteSearchParams>
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { walletAddress, slug } = await params
  const { network: rawNetwork } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
    return { title: 'Medal Not Found — Frontier Chronicle' }
  }

  const definition = getMedalDefinitionBySlug(slug)

  if (!definition) {
    return { title: 'Medal Not Found — Frontier Chronicle' }
  }

  try {
    const network = resolveWarriorNetwork(rawNetwork)
    const snapshot = await getChronicleSnapshot(walletAddress, network)
    return buildMedalPageMetadata({
      snapshot,
      walletAddress,
      network,
      slug: definition.slug,
    })
  } catch {
    return { title: `${definition.subtitle} — Frontier Chronicle` }
  }
}

export default async function MedalSharePage({ params, searchParams }: PageProps) {
  const { walletAddress, slug } = await params
  const { network: rawNetwork } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
    notFound()
  }

  const definition = getMedalDefinitionBySlug(slug)

  if (!definition) {
    notFound()
  }

  const network = resolveWarriorNetwork(rawNetwork)

  let snapshot
  try {
    snapshot = await getChronicleSnapshot(walletAddress, network)
  } catch {
    notFound()
  }

  const medal = getSnapshotMedal(snapshot, definition.slug)

  if (!medal) {
    notFound()
  }

  const status = medal.claimed
    ? {
        label: 'Chain Bound on Sui',
        tone: '#7ec38f',
        shell: 'rgba(126,195,143,0.12)',
        border: 'rgba(126,195,143,0.3)',
        summary: 'This medal is already bound to the current wallet on-chain.',
      }
    : medal.unlocked
      ? {
          label: 'Chronicle Verified',
          tone: '#d9a441',
          shell: 'rgba(217,164,65,0.12)',
          border: 'rgba(217,164,65,0.3)',
          summary: 'Chronicle has verified the activity, but the medal is not bound on-chain yet.',
        }
      : {
          label: 'Not Yet Verified',
          tone: '#e63946',
          shell: 'rgba(230,57,70,0.12)',
          border: 'rgba(230,57,70,0.3)',
          summary: 'Chronicle has not indexed enough evidence for this medal yet.',
        }

  return (
    <MedalPageClient
      snapshot={snapshot}
      medal={medal}
      definition={definition}
      walletAddress={walletAddress}
      network={network}
      status={status}
    />
  )
}
