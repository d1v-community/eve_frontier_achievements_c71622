'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type {
  MockMedalTxAction,
  MockMedalTxReceipt,
} from '../mock/mockTransaction'

const truncateMiddle = (value: string, prefix = 8, suffix = 6) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`

const MockWalletConfirmDialog = ({
  open,
  action,
  medalTitle,
  walletAddress,
  network,
  receipt,
  onConfirm,
  onClose,
}: {
  open: boolean
  action: MockMedalTxAction | null
  medalTitle: string | null
  walletAddress: string | null
  network: string | null
  receipt?: MockMedalTxReceipt | null
  onConfirm: () => void
  onClose: () => void
}) => {
  const t = useTranslations('mockFlow.wallet')

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

  if (!open || !action || !medalTitle || !walletAddress || !network) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/76 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="sds-panel relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#f0642f]/20 bg-[linear-gradient(145deg,rgba(12,13,15,0.98),rgba(18,20,22,0.94))] px-6 py-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
              {t('eyebrow')}
            </div>
            <h2 className="mt-4 font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
              {t('title', { action: t(`actions.${action}`) })}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#f4efe2]/68">
              {t('body', { action: t(`actions.${action}`), medalTitle })}
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
          <div className="border border-white/10 bg-black/16 px-4 py-4">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/42">
              {t('fields.action')}
            </div>
            <div className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f4efe2]">
              {t(`actions.${action}`)}
            </div>
          </div>
          <div className="border border-white/10 bg-black/16 px-4 py-4">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/42">
              {t('fields.network')}
            </div>
            <div className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f4efe2]">
              {network}
            </div>
          </div>
          <div className="border border-white/10 bg-black/16 px-4 py-4">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/42">
              {t('fields.medal')}
            </div>
            <div className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f4efe2]">
              {medalTitle}
            </div>
          </div>
          <div className="border border-white/10 bg-black/16 px-4 py-4">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/42">
              {t('fields.wallet')}
            </div>
            <div className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f4efe2]">
              {truncateMiddle(walletAddress)}
            </div>
          </div>
        </div>

        {receipt ? (
          <div className="mt-6 rounded-[1.2rem] border border-[#f0642f]/18 bg-[linear-gradient(180deg,rgba(240,100,47,0.08),rgba(255,255,255,0.03))] px-4 py-4">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#ffd2c2]">
              {t('estimateTitle')}
            </div>
            <div className="mt-4 grid gap-3 text-xs leading-6 text-[#f4efe2]/68 sm:grid-cols-2">
              <div>
                <span className="font-mono uppercase tracking-[0.16em] text-white/42">
                  {t('fields.package')}
                </span>{' '}
                {truncateMiddle(receipt.packageId, 10, 8)}
              </div>
              <div>
                <span className="font-mono uppercase tracking-[0.16em] text-white/42">
                  {t('fields.object')}
                </span>{' '}
                {truncateMiddle(receipt.objectId, 10, 8)}
              </div>
              <div>
                <span className="font-mono uppercase tracking-[0.16em] text-white/42">
                  {t('fields.gasBudget')}
                </span>{' '}
                {receipt.gasBudget}
              </div>
              <div>
                <span className="font-mono uppercase tracking-[0.16em] text-white/42">
                  {t('fields.storageRebate')}
                </span>{' '}
                {receipt.storageRebate}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          {(['prepare', 'sign', 'finalize'] as const).map((item) => (
            <div
              key={item}
              className="border border-white/10 bg-black/18 px-4 py-4"
            >
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#ffd2c2]">
                {t(`checklist.${item}.label`)}
              </div>
              <div className="mt-2 text-sm leading-6 text-[#f4efe2]/68">
                {t(`checklist.${item}.detail`, { medalTitle })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.2rem] border border-[#d9a441]/18 bg-[#d9a441]/6 px-4 py-4 text-sm leading-7 text-[#f4efe2]/74">
          {t('note')}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-white/12 bg-white/4 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/74"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="border border-[#f0642f]/32 bg-[#f0642f]/12 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#ffd2c2]"
          >
            {t('confirm', { action: t(`actions.${action}`) })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MockWalletConfirmDialog
