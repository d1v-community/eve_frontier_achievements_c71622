import { isValidSuiAddress } from '@mysten/sui/utils'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { getMedalDefinitionBySlug } from '~~/chronicle/config/medals'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { getMockRouteSnapshot } from '~~/server/chronicle/mockRouteSnapshot'
import {
  buildMedalPageMetadata,
  getSnapshotMedal,
} from '~~/server/warrior/medalShare'
import {
  type WarriorRouteSearchParams,
  isMockWarriorRoute,
  resolveMockClaimedSlugs,
  resolveWarriorNetwork,
} from '~~/warrior/share'
import MedalPageClient from './MedalPageClient'

interface PageProps {
  params: Promise<{ walletAddress: string; slug: string }>
  searchParams: Promise<WarriorRouteSearchParams>
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'medalPage.meta' })
  const { walletAddress, slug } = await params
  const {
    network: rawNetwork,
    m: rawMock,
    claimed: rawClaimed,
  } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
    return { title: t('notFound') }
  }

  const definition = getMedalDefinitionBySlug(slug, locale)

  if (!definition) {
    return { title: t('notFound') }
  }

  try {
    const network = resolveWarriorNetwork(rawNetwork)
    const snapshot = isMockWarriorRoute(rawMock)
      ? getMockRouteSnapshot(
          walletAddress,
          network,
          resolveMockClaimedSlugs(rawClaimed),
          locale
        )
      : await getChronicleSnapshot(walletAddress, network, locale)
    return buildMedalPageMetadata({
      snapshot,
      walletAddress,
      network,
      slug: definition.slug,
      locale,
    })
  } catch {
    return { title: `${definition.subtitle} — ${t('fallbackSuffix')}` }
  }
}

export default async function MedalSharePage({
  params,
  searchParams,
}: PageProps) {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'medalPage.status' })
  const { walletAddress, slug } = await params
  const {
    network: rawNetwork,
    m: rawMock,
    claimed: rawClaimed,
  } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
    notFound()
  }

  const definition = getMedalDefinitionBySlug(slug, locale)

  if (!definition) {
    notFound()
  }

  const network = resolveWarriorNetwork(rawNetwork)

  let snapshot
  try {
    snapshot = isMockWarriorRoute(rawMock)
      ? getMockRouteSnapshot(
          walletAddress,
          network,
          resolveMockClaimedSlugs(rawClaimed),
          locale
        )
      : await getChronicleSnapshot(walletAddress, network, locale)
  } catch {
    notFound()
  }

  const medal = getSnapshotMedal(snapshot, definition.slug)

  if (!medal) {
    notFound()
  }

  const status = medal.claimed
    ? {
        label: t('bound.label'),
        tone: '#7ec38f',
        shell: 'rgba(126,195,143,0.12)',
        border: 'rgba(126,195,143,0.3)',
        summary: t('bound.summary'),
      }
    : medal.unlocked
      ? {
          label: t('verified.label'),
          tone: '#d9a441',
          shell: 'rgba(217,164,65,0.12)',
          border: 'rgba(217,164,65,0.3)',
          summary: t('verified.summary'),
        }
      : {
          label: t('locked.label'),
          tone: '#e63946',
          shell: 'rgba(230,57,70,0.12)',
          border: 'rgba(230,57,70,0.3)',
          summary: t('locked.summary'),
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
