'use client'

import EveButton from '@eveworld/ui-components/components/EveButton'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

const truncateMiddle = (value: string, prefix = 10, suffix = 8) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`

const DemoMintSuccessDialog = ({
  digest,
  explorerUrl,
  medalTitle,
  medalSubtitle,
  open,
  onClose,
  onContinueShare,
}: {
  digest: string | null
  explorerUrl: string | null
  medalTitle: string | null
  medalSubtitle: string | null
  open: boolean
  onClose: () => void
  onContinueShare: () => void
}) => {
  const t = useTranslations('chronicleDashboard.demoMintSuccess')

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open])

  if (!open || !digest || !medalTitle || !medalSubtitle) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/78 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="sds-panel relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#7ec38f]/20 bg-[linear-gradient(145deg,rgba(12,13,15,0.98),rgba(18,20,22,0.94))] px-6 py-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#7ec38f]">
              {t('eyebrow')}
            </div>
            <h2 className="mt-4 font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
              {t('title')}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#f4efe2]/68">
              {t('body', { medalTitle })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/12 bg-white/4 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/68"
          >
            {t('close')}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="border border-white/10 bg-black/18 px-4 py-4">
            <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-white/42">
              {t('fields.medal')}
            </div>
            <div className="mt-3 font-display text-2xl uppercase tracking-[0.06em] text-[#f4efe2]">
              {medalTitle}
            </div>
            <div className="mt-2 text-sm uppercase tracking-[0.18em] text-white/52">
              {medalSubtitle}
            </div>
          </div>

          <div className="border border-white/10 bg-black/18 px-4 py-4">
            <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-white/42">
              {t('fields.digest')}
            </div>
            <div className="mt-3 break-all font-mono text-sm leading-7 text-[#f4efe2]">
              {truncateMiddle(digest, 18, 14)}
            </div>
          </div>
        </div>

        <div className="mt-4 border border-[#f0642f]/24 bg-[linear-gradient(180deg,rgba(240,100,47,0.08),rgba(255,255,255,0.02))] px-4 py-4 text-sm leading-7 text-[#ffd2c2]">
          <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-[#f7b8a2]">
            {t('noteEyebrow')}
          </div>
          <div className="mt-3">{t('note')}</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <EveButton
            typeClass="primary"
            className="!min-w-[11rem] !self-auto"
            onClick={onContinueShare}
          >
            {t('actions.share')}
          </EveButton>
          <EveButton
            typeClass="ghost"
            className="!min-w-[11rem] !self-auto"
            onClick={() => {
              if (!explorerUrl) {
                return
              }

              window.open(explorerUrl, '_blank', 'noopener,noreferrer')
            }}
          >
            {t('actions.explorer')}
          </EveButton>
        </div>
      </div>
    </div>
  )
}

export default DemoMintSuccessDialog
