'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { getMedalLoreBySlug } from '~~/chronicle/config/medalLore'
import type { ChronicleMedalState, ChronicleSnapshot } from '~~/chronicle/types'
import type { MedalDefinition } from '~~/chronicle/config/medals'
import { getSuiExplorerUrl } from '~~/chronicle/helpers/sui'
import { withLocale } from '~~/i18n/pathnames'
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
  const locale = useLocale()
  const t = useTranslations('medalPage')
  const homeHref = withLocale(locale, '/')
  const warriorHref = withLocale(
    locale,
    `/warrior/${walletAddress}?network=${network}`
  )
  const lore = getMedalLoreBySlug(medal.slug, locale)

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
            <a href={homeHref} className="transition-opacity hover:opacity-60">
              {t('breadcrumb.home')}
            </a>
            <span>•</span>
            <a
              href={warriorHref}
              className="transition-opacity hover:opacity-60"
            >
              {t('breadcrumb.warrior')}
            </a>
          </div>

          <section className="sds-panel overflow-hidden rounded-[2rem] border px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
                  {t('eyebrow')}
                </div>
                <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {definition.subtitle}
                </h1>
                {definition.title !== definition.subtitle ? (
                  <p className="text-white/66 mt-2 text-lg tracking-[0.16em]">
                    {definition.title}
                  </p>
                ) : null}
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                  {status.summary} {t('summarySuffix')}
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
                [t('stats.wallet'), snapshot.profile.walletAddress],
                [t('stats.network'), network.toUpperCase()],
                [
                  t('stats.character'),
                  snapshot.profile.characterId || t('stats.unavailable'),
                ],
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
              <div className="text-white/42 font-mono text-[0.62rem] uppercase tracking-[0.28em]">
                {t('evidenceTitle')}
              </div>
              <div className="text-[#f4efe2]/76 mt-4 text-base leading-8">
                {medal.proof || t('evidenceFallback')}
              </div>

              <div className="text-white/42 mt-8 font-mono text-[0.62rem] uppercase tracking-[0.28em]">
                {t('requirementTitle')}
              </div>
              <div className="text-[#f4efe2]/76 mt-4 text-base leading-8">
                {definition.requirement}
              </div>

              <div className="text-white/42 mt-8 font-mono text-[0.62rem] uppercase tracking-[0.28em]">
                {t('contextTitle')}
              </div>
              <div className="text-[#f4efe2]/76 mt-4 text-base leading-8">
                {lore.frontierContext}
              </div>
            </article>

            <article className="sds-panel rounded-[1.8rem] border px-6 py-6">
              <div className="text-white/42 font-mono text-[0.62rem] uppercase tracking-[0.28em]">
                {t('stateTitle')}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  t('chips.rarity', { rarity: definition.rarity }),
                  medal.claimed
                    ? t('chips.bound')
                    : medal.unlocked
                      ? t('chips.verified')
                      : t('chips.locked'),
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

              <div className="text-white/62 mt-8 text-sm leading-7">
                {t('liveNote')}
              </div>

              <div
                className="text-[#f4efe2]/72 mt-8 rounded-2xl border px-4 py-4 text-sm leading-7"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="text-white/42 font-mono text-[0.62rem] uppercase tracking-[0.26em]">
                  {t('whyTitle')}
                </div>
                <div className="mt-3">{lore.whyItMatters}</div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={warriorHref}
                  className="rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#f4efe2] transition-opacity hover:opacity-70"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  {t('actions.openWarrior')}
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
                  {t('actions.shareMedal')}
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
                    {t('actions.viewExplorer')}
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
