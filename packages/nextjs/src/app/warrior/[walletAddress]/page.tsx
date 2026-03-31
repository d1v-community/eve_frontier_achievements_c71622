import { isValidSuiAddress } from '@mysten/sui/utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { withLocale } from '~~/i18n/pathnames'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { getMockRouteSnapshot } from '~~/server/chronicle/mockRouteSnapshot'
import { buildWarriorPageMetadata } from '~~/server/warrior/share'
import {
  isMockWarriorRoute,
  resolveMockClaimedSlugs,
  resolveWarriorNetwork,
  type WarriorRouteSearchParams,
} from '~~/warrior/share'
import WarriorCard from './components/WarriorCard'

interface PageProps {
  params: Promise<{ walletAddress: string }>
  searchParams: Promise<WarriorRouteSearchParams>
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'warriorPage' })
  const { walletAddress } = await params
  const {
    network: rawNetwork,
    m: rawMock,
    claimed: rawClaimed,
  } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
    return { title: t('meta.notFound') }
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
    return buildWarriorPageMetadata({
      snapshot,
      walletAddress,
      network,
      locale,
    })
  } catch {
    return { title: t('meta.fallback') }
  }
}

export default async function WarriorPage({ params, searchParams }: PageProps) {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'warriorPage' })
  const { walletAddress } = await params
  const {
    network: rawNetwork,
    m: rawMock,
    claimed: rawClaimed,
  } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
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

  const isMockMode = isMockWarriorRoute(rawMock)

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-16"
      style={{ background: 'var(--sds-dark)' }}
    >
      <div className="w-full max-w-2xl">
        {/* Back link */}
        <a
          href={withLocale(locale, '/')}
          className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--sds-font-mono)',
          }}
        >
          {t('backLink')}
        </a>

        <WarriorCard snapshot={snapshot} isMockMode={isMockMode} />
      </div>
    </main>
  )
}
