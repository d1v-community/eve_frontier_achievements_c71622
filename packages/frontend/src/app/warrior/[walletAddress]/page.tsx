import { isValidSuiAddress } from '@mysten/sui/utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { buildWarriorPageMetadata } from '~~/server/warrior/share'
import {
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
  const { walletAddress } = await params
  const { network: rawNetwork } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
    return { title: 'Warrior Not Found — Frontier Chronicle' }
  }

  try {
    const network = resolveWarriorNetwork(rawNetwork)
    const snapshot = await getChronicleSnapshot(walletAddress, network)
    return buildWarriorPageMetadata({ snapshot, walletAddress, network })
  } catch {
    return { title: 'Warrior Profile — Frontier Chronicle' }
  }
}

export default async function WarriorPage({ params, searchParams }: PageProps) {
  const { walletAddress } = await params
  const { network: rawNetwork } = await searchParams

  if (!isValidSuiAddress(walletAddress)) {
    notFound()
  }

  const network = resolveWarriorNetwork(rawNetwork)

  let snapshot
  try {
    snapshot = await getChronicleSnapshot(walletAddress, network)
  } catch {
    notFound()
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-16"
      style={{ background: 'var(--sds-dark)' }}
    >
      <div className="w-full max-w-2xl">
        {/* Back link */}
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--sds-font-mono)',
          }}
        >
          ← Frontier Chronicle
        </a>

        <WarriorCard snapshot={snapshot} />
      </div>
    </main>
  )
}
