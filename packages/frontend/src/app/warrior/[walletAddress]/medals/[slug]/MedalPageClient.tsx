'use client'

import { useState } from 'react'
import type { ChronicleMedalState, ChronicleSnapshot } from '~~/chronicle/types'
import type { MedalDefinition } from '~~/chronicle/config/medals'
import { getSuiExplorerUrl } from '~~/chronicle/helpers/sui'
import type { ENetwork } from '~~/types/ENetwork'
import MedalShareDialog from '../../components/MedalShareDialog'

interface MedalPageClientProps {
  snapshot: ChronicleSnapshot
  medal: ChronicleMedalState
  definition: MedalDefinition
  walletAddress: string
  network: ENetwork
  status: {
    label: string
    tone: string
    shell: string
    border: string
    summary: string
  }
}

export default function MedalPageClient({
  snapshot,
  medal,
  definition,
  walletAddress,
  network,
  status,
}: MedalPageClientProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)

  return (
    <>
      <main
        className="min-h-screen px-4 py-12"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(240,100,47,0.12), transparent 22%), var(--sds-dark)',
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/45">
            <a href="/" className="transition-opacity hover:opacity-60">
              Frontier Chronicle
            </a>
            <span>•</span>
            <a
              href={`/warrior/${walletAddress}?network=${network}`}
              className="transition-opacity hover:opacity-60"
            >
              Warrior Profile
            </a>
          </div>

          <section className="sds-panel overflow-hidden rounded-[2rem] border px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
                  medal verification record
                </div>
                <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {definition.subtitle}
                </h1>
                <p className="mt-2 text-lg tracking-[0.16em] text-white/66">
                  {definition.title}
                </p>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                  {status.summary} This page reloads the latest Chronicle snapshot and
                  Sui ownership state for the target wallet each time it opens.
                </p>
              </div>

              <div
                className="self-start rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.28em]"
                style={{
                  color: status.tone,
                  background: status.shell,
                  borderColor: status.border,
                }}
              >
                {status.label}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ['Wallet', snapshot.profile.walletAddress],
                ['Network', network.toUpperCase()],
                ['Character', snapshot.profile.characterId || 'Unavailable'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border px-4 py-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/40">
                    {label}
                  </div>
                  <div className="mt-3 break-all text-sm leading-7 text-[#f4efe2]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="sds-panel rounded-[1.8rem] border px-6 py-6">
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/42">
                indexed evidence
              </div>
              <div className="mt-4 text-base leading-8 text-[#f4efe2]/76">
                {medal.proof || 'Chronicle has not published an evidence string for this medal yet.'}
              </div>

              <div className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/42">
                requirement
              </div>
              <div className="mt-4 text-base leading-8 text-[#f4efe2]/76">
                {definition.requirement}
              </div>
            </article>

            <article className="sds-panel rounded-[1.8rem] border px-6 py-6">
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/42">
                medal state
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  `${definition.rarity} Medal`,
                  medal.claimed ? 'Bound' : medal.unlocked ? 'Verified' : 'Locked',
                  `${medal.progressCurrent} / ${medal.progressTarget}`,
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em]"
                    style={{
                      color: '#f4efe2',
                      borderColor: 'rgba(255,255,255,0.14)',
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-8 text-sm leading-7 text-white/62">
                如果这个链接来自社交平台预览图，落地到这里以后看到的不是静态截图，而是重新计算过的 Chronicle 快照与链上归属状态。
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`/warrior/${walletAddress}?network=${network}`}
                  className="rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#f4efe2] transition-opacity hover:opacity-70"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  Open Warrior Profile
                </a>
                <button
                  type="button"
                  onClick={() => setShowShareDialog(true)}
                  className="rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                  style={{
                    color: '#f0642f',
                    borderColor: 'rgba(240,100,47,0.28)',
                    background: 'rgba(240,100,47,0.12)',
                  }}
                >
                  Share Medal
                </button>
                {medal.claimed && (
                  <a
                    href={getSuiExplorerUrl(network, walletAddress, 'address')}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                    style={{
                      color: '#69b8f7',
                      borderColor: 'rgba(105,184,247,0.28)',
                      background: 'rgba(105,184,247,0.12)',
                    }}
                  >
                    View on Sui Explorer ↗
                  </a>
                )}
              </div>
            </article>
          </section>
        </div>
      </main>

      {showShareDialog && (
        <MedalShareDialog
          medal={medal}
          walletAddress={walletAddress}
          network={network}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </>
  )
}
