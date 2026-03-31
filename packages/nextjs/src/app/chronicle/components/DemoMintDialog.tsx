'use client'

import EveButton from '@eveworld/ui-components/components/EveButton'
import EveLinearBar from '@eveworld/ui-components/components/EveLinearBar'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { getInsufficientEvidenceLabel } from '~~/chronicle/config/businessCopy'
import type { ChronicleDemoMintCandidate } from '~~/chronicle/types'

const DemoMintDialog = ({
  candidates,
  open,
  submittingSlug,
  onClose,
  onConfirm,
}: {
  candidates: ChronicleDemoMintCandidate[]
  open: boolean
  submittingSlug: string | null
  onClose: () => void
  onConfirm: (candidate: ChronicleDemoMintCandidate) => void
}) => {
  const locale = useLocale()
  const t = useTranslations('chronicleDashboard.demoMintDialog')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submittingSlug) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open, submittingSlug])

  const resolvedSelectedSlug =
    selectedSlug && candidates.some((candidate) => candidate.slug === selectedSlug)
      ? selectedSlug
      : (candidates[0]?.slug ?? null)

  const selectedCandidate = useMemo(
    () =>
      candidates.find((candidate) => candidate.slug === resolvedSelectedSlug) ??
      candidates[0] ??
      null,
    [candidates, resolvedSelectedSlug]
  )
  const emptyEvidenceLabel = getInsufficientEvidenceLabel(locale)

  if (!open || !selectedCandidate) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/76 px-4 py-6 backdrop-blur-sm"
      onClick={() => {
        if (!submittingSlug) {
          onClose()
        }
      }}
    >
      <div
        className="sds-panel relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#f0642f]/20 bg-[linear-gradient(145deg,rgba(12,13,15,0.98),rgba(18,20,22,0.94))] px-6 py-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
              {t('eyebrow')}
            </div>
            <h2 className="mt-4 font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
              {t('title')}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#f4efe2]/68">
              {t('body')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submittingSlug != null}
            className="rounded-full border border-white/12 bg-white/4 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/68 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('close')}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="grid gap-3">
            {candidates.map((candidate) => {
              const selected = candidate.slug === selectedCandidate.slug
              const submitting = submittingSlug === candidate.slug

              return (
                <button
                  key={candidate.slug}
                  type="button"
                  onClick={() => setSelectedSlug(candidate.slug)}
                  disabled={submittingSlug != null}
                  className={`border px-4 py-4 text-left transition-all ${
                    selected
                      ? 'border-[#f0642f]/44 bg-[linear-gradient(135deg,rgba(240,100,47,0.16),rgba(255,255,255,0.03))]'
                      : 'border-white/10 bg-black/18 hover:border-white/18'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-[#f0642f]">
                        {candidate.subtitle}
                      </div>
                      <div className="mt-3 font-display text-2xl uppercase tracking-[0.06em] text-[#f4efe2]">
                        {candidate.title}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="border border-white/10 bg-white/6 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/72">
                        {candidate.rarity}
                      </span>
                      {selected ? (
                        <span className="border border-[#f0642f]/28 bg-[#f0642f]/12 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#ffd2c2]">
                          {t('selected')}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 text-sm leading-7 text-[#f4efe2]/66">
                    {candidate.requirement}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/48">
                      <span>{candidate.progressLabel}</span>
                      <span>{candidate.progressPercent}%</span>
                    </div>
                    <div className="mt-3">
                      <EveLinearBar
                        nominator={candidate.progressCurrent}
                        denominator={candidate.progressTarget}
                      />
                    </div>
                  </div>

                  {submitting ? (
                    <div className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#ffd2c2]">
                      {t('submitting')}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </section>

          <section className="border border-white/10 bg-black/18 px-5 py-5">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
              {t('previewEyebrow')}
            </div>
            <h3 className="mt-4 font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
              {selectedCandidate.title}
            </h3>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/52">
              {selectedCandidate.subtitle}
            </p>
            <p className="mt-4 text-sm leading-7 text-[#f4efe2]/68">
              {selectedCandidate.teaser}
            </p>

            <div className="mt-5 border border-white/10 bg-black/16 px-4 py-4">
              <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-white/42">
                {t('sections.progress')}
              </div>
              <div className="mt-3 text-sm leading-7 text-[#f4efe2]/72">
                {selectedCandidate.progressLabel}
              </div>
            </div>

            <div className="mt-4 border border-white/10 bg-black/16 px-4 py-4">
              <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-white/42">
                {t('sections.evidence')}
              </div>
              <div className="mt-3 text-sm leading-7 text-[#f4efe2]/72">
                {selectedCandidate.proof || emptyEvidenceLabel}
              </div>
            </div>

            <div className="mt-4 border border-[#d9a441]/24 bg-[linear-gradient(180deg,rgba(217,164,65,0.08),rgba(255,255,255,0.02))] px-4 py-4 text-sm leading-7 text-[#f3ddb0]">
              <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-[#f7d58a]">
                {t('noteEyebrow')}
              </div>
              <div className="mt-3">{t('note')}</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <EveButton
                typeClass="primary"
                className="!min-w-[12rem] !self-auto"
                disabled={submittingSlug != null}
                onClick={() => onConfirm(selectedCandidate)}
              >
                {submittingSlug ? t('submitting') : t('confirm')}
              </EveButton>
              <EveButton
                typeClass="ghost"
                className="!min-w-[9rem] !self-auto"
                disabled={submittingSlug != null}
                onClick={onClose}
              >
                {t('cancel')}
              </EveButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DemoMintDialog
