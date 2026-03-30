'use client'

import { useTranslations } from 'next-intl'
import type { MockMedalTxReceipt } from '../mock/mockTransaction'

const truncateMiddle = (value: string, prefix = 10, suffix = 8) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`

const MockTransactionPanel = ({
  receipt,
  isRunning,
  className = '',
}: {
  receipt: MockMedalTxReceipt
  isRunning: boolean
  className?: string
}) => {
  const t = useTranslations('mockFlow')

  return (
    <div
      className={`border border-[#f0642f]/24 bg-[linear-gradient(180deg,rgba(240,100,47,0.08),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-[#f4efe2] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#ffd2c2]">
          {isRunning ? t('panel.pipeline') : t('panel.receipt')}
        </div>
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#f4efe2]/64">
          {t(`actions.${receipt.action}`)} // {t('panel.step', {
            current: receipt.currentStageIndex + 1,
            total: receipt.stages.length,
          })}
        </div>
      </div>

      <div className="mt-3 rounded-[1rem] border border-white/10 bg-black/18 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#f4efe2]/42">
              {t('panel.explorerTitle')}
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#f4efe2]">
              {receipt.medalTitle} · {t(`actions.${receipt.action}`)}
            </div>
          </div>
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#7ec38f]">
            {isRunning ? t('panel.pending') : t('panel.finalized')}
          </div>
        </div>
        <div className="mt-3 text-sm leading-6 text-[#f4efe2]/66">
          {t('panel.explorerBody')}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {receipt.stages.map((stage, index) => {
          const isCurrent = index === receipt.currentStageIndex
          const isDone = index < receipt.currentStageIndex || !isRunning

          return (
            <div
              key={stage.id}
              className="border px-3 py-3"
              style={{
                borderColor: isCurrent
                  ? 'rgba(240,100,47,0.32)'
                  : 'rgba(255,255,255,0.08)',
                background: isCurrent
                  ? 'rgba(240,100,47,0.12)'
                  : isDone
                    ? 'rgba(126,195,143,0.08)'
                    : 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em]">
                  {t(`stages.${receipt.action}.${stage.id}.label`)}
                </div>
                <div className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#f4efe2]/54">
                  {isCurrent
                    ? t('statuses.running')
                    : isDone
                      ? t('statuses.done')
                      : t('statuses.queued')}
                </div>
              </div>
              <div className="mt-2 text-sm leading-6 text-[#f4efe2]/72">
                {t(`stages.${receipt.action}.${stage.id}.detail`, {
                  medalTitle: receipt.medalTitle,
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-2 text-xs leading-6 text-[#f4efe2]/66 sm:grid-cols-2">
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.digest')}
          </span>{' '}
          {receipt.digest}
        </div>
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.checkpoint')}
          </span>{' '}
          #{receipt.checkpoint}
        </div>
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.package')}
          </span>{' '}
          {receipt.packageId.slice(0, 18)}...
        </div>
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.object')}
          </span>{' '}
          {receipt.objectId.slice(0, 18)}...
        </div>
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.gasBudget')}
          </span>{' '}
          {receipt.gasBudget}
        </div>
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.gasUsed')}
          </span>{' '}
          {receipt.gasUsed}
        </div>
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.storageRebate')}
          </span>{' '}
          {receipt.storageRebate}
        </div>
        <div>
          <span className="font-mono uppercase tracking-[0.16em] text-[#f4efe2]/46">
            {t('fields.updatedAt')}
          </span>{' '}
          {new Date(receipt.at).toLocaleString()}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1rem] border border-white/10 bg-black/18 px-4 py-4">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#ffd2c2]">
            {t('sections.events')}
          </div>
          <div className="mt-3 grid gap-2">
            {receipt.events.map((event) => (
              <div
                key={`${event.module}-${event.type}`}
                className="border border-white/10 bg-black/18 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#f4efe2]">
                    {t(`events.${event.id}.label`)}
                  </div>
                  <div className="font-mono text-[0.54rem] uppercase tracking-[0.16em] text-white/40">
                    {event.type}
                  </div>
                </div>
                <div className="mt-2 text-xs leading-6 text-[#f4efe2]/68">
                  {t(`events.${event.id}.detail`, {
                    medalTitle: receipt.medalTitle,
                  })}
                </div>
                <div className="mt-2 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-white/38">
                  {event.module}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1rem] border border-white/10 bg-black/18 px-4 py-4">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#ffd2c2]">
            {t('sections.objectChanges')}
          </div>
          <div className="mt-3 grid gap-2">
            {receipt.objectChanges.map((change) => (
              <div
                key={`${change.kind}-${change.objectId}-${change.role}`}
                className="border border-white/10 bg-black/18 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#f4efe2]">
                    {t(`objectChanges.roles.${change.role}`)}
                  </div>
                  <div className="font-mono text-[0.54rem] uppercase tracking-[0.16em] text-white/40">
                    {t(`objectChanges.kinds.${change.kind}`)}
                  </div>
                </div>
                <div className="mt-2 text-xs leading-6 text-[#f4efe2]/68">
                  {truncateMiddle(change.objectId)}
                </div>
                <div className="mt-2 text-xs leading-6 text-[#f4efe2]/52">
                  {change.objectType}
                </div>
                <div className="mt-2 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-white/38">
                  {change.owner
                    ? t('objectChanges.owner', { owner: change.owner })
                    : t('objectChanges.ownerDeleted')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MockTransactionPanel
