'use client'

import EveButton from '@eveworld/ui-components/components/EveButton'
import EveLinearBar from '@eveworld/ui-components/components/EveLinearBar'
import type { ChronicleMedalState } from '~~/chronicle/types'
import { getMedalDefinitionByKind } from '../config/medals'

const TONE_STYLES = {
  crimson: {
    shell:
      'border-[#f0642f]/30 bg-[linear-gradient(180deg,rgba(240,100,47,0.12),rgba(10,10,11,0.96))] text-[#fef0ea]',
    badge: 'border-[#f0642f]/30 bg-[#f0642f]/12 text-[#ffd2c2]',
    bar: 'from-[#f0642f] via-[#f18a64] to-[#f5c18d]',
    accent: 'text-[#ffd2c2]',
  },
  azure: {
    shell:
      'border-[#8ea1ad]/30 bg-[linear-gradient(180deg,rgba(142,161,173,0.12),rgba(10,10,11,0.96))] text-[#eff6fa]',
    badge: 'border-[#8ea1ad]/30 bg-[#8ea1ad]/12 text-[#d8e2e8]',
    bar: 'from-[#708895] via-[#8ea1ad] to-[#b1c1c9]',
    accent: 'text-[#d8e2e8]',
  },
  teal: {
    shell:
      'border-[#d9a441]/30 bg-[linear-gradient(180deg,rgba(217,164,65,0.12),rgba(10,10,11,0.96))] text-[#faf3de]',
    badge: 'border-[#d9a441]/30 bg-[#d9a441]/12 text-[#f5dfae]',
    bar: 'from-[#c98f33] via-[#d9a441] to-[#e7c06c]',
    accent: 'text-[#f5dfae]',
  },
  amber: {
    shell:
      'border-[#b45309]/30 bg-[linear-gradient(180deg,rgba(180,83,9,0.12),rgba(10,10,11,0.96))] text-[#fef3c7]',
    badge: 'border-[#b45309]/30 bg-[#b45309]/12 text-[#fcd34d]',
    bar: 'from-[#92400e] via-[#b45309] to-[#d97706]',
    accent: 'text-[#fcd34d]',
  },
  steel: {
    shell:
      'border-[#475569]/30 bg-[linear-gradient(180deg,rgba(71,85,105,0.12),rgba(10,10,11,0.96))] text-[#f1f5f9]',
    badge: 'border-[#475569]/30 bg-[#475569]/12 text-[#cbd5e1]',
    bar: 'from-[#334155] via-[#475569] to-[#64748b]',
    accent: 'text-[#cbd5e1]',
  },
} as const

const MedalCard = ({
  medal,
  isClaiming,
  onAction,
  actionLabel,
  onShare,
}: {
  medal: ChronicleMedalState
  isClaiming: boolean
  onAction: () => void
  actionLabel: string | null
  onShare?: (() => void) | null
}) => {
  const definition = getMedalDefinitionByKind(medal.kind)
  const tone = definition ? TONE_STYLES[definition.tone] : TONE_STYLES.azure

  const status = medal.claimed
    ? 'Bound'
    : medal.claimable
      ? 'Ready'
      : medal.unlocked
        ? 'Verified'
        : 'Tracking'

  const statusDetail = medal.claimed
    ? '该奖章已经绑定到当前钱包。'
    : actionLabel === 'Mint Medal'
      ? '条件满足，当前可以直接走公开 mint，把这枚奖章铸到钱包里。'
      : medal.claimable
      ? '条件满足，可以立即发起链上 Claim。'
      : medal.unlocked
        ? '门槛已经到位，但当前链上领取通道还没就绪。'
        : '条件尚未满足，继续在边境留下可验证轨迹。'

  return (
    <article
      className={`relative overflow-hidden border px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1 ${tone.shell} ${!medal.unlocked ? 'opacity-90 saturate-[0.9]' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/48 font-mono text-[0.62rem] uppercase tracking-[0.32em]">
            {medal.subtitle}
          </div>
          <h3 className="mt-3 font-display text-3xl uppercase leading-none tracking-[0.08em]">
            {medal.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em] ${tone.badge}`}
          >
            {medal.rarity}
          </span>
          <span className="bg-black/14 text-white/68 border border-white/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em]">
            {status}
          </span>
        </div>
      </div>

      <p className="text-white/74 mt-4 text-sm leading-7">{medal.teaser}</p>

      <div className="bg-black/14 text-white/74 mt-6 border border-white/10 px-4 py-4 text-sm leading-7">
        <div className="text-white/42 font-mono text-[0.62rem] uppercase tracking-[0.28em]">
          threshold
        </div>
        <div className="mt-3">{medal.requirement}</div>
      </div>

      <div className="mt-5">
        <div className="text-white/58 flex items-center justify-between text-xs uppercase tracking-[0.18em]">
          <span>{medal.progressLabel}</span>
          <span>{medal.progressPercent}%</span>
        </div>

        <div className="text-white/72 mt-3 text-sm">
          <EveLinearBar
            nominator={medal.progressCurrent}
            denominator={medal.progressTarget}
          />
        </div>
      </div>

      <div className="bg-black/14 text-white/74 mt-5 border border-white/10 px-4 py-4 text-sm leading-7">
        <div className="text-white/42 font-mono text-[0.62rem] uppercase tracking-[0.28em]">
          indexed evidence
        </div>
        <div className={`mt-3 text-sm leading-7 ${tone.accent}`}>
          {medal.proof || '系统还没有抓到足够的 Frontier 行为证据。'}
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="text-white/68 min-h-10 flex-1 text-sm leading-7">
          {statusDetail}
        </div>

        {actionLabel || onShare ? (
          <div className="flex shrink-0 flex-col gap-2">
            {actionLabel ? (
              <EveButton
                typeClass="primary"
                className="!min-w-[10.75rem] !self-auto"
                disabled={isClaiming}
                onClick={() => onAction()}
              >
                {isClaiming ? 'Submitting...' : actionLabel}
              </EveButton>
            ) : null}
            {onShare ? (
              <button
                type="button"
                onClick={() => onShare()}
                className="border border-white/12 bg-white/6 px-4 py-3 text-left font-mono text-[0.68rem] uppercase tracking-[0.22em] text-white/78 transition-transform hover:-translate-y-0.5 hover:bg-white/10"
              >
                Share Card
              </button>
            ) : null}
          </div>
        ) : (
          <div className="bg-black/14 border border-white/10 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/65">
            {medal.claimed
              ? 'Bound'
              : medal.unlocked
                ? 'Await Chain'
                : 'Locked'}
          </div>
        )}
      </div>
    </article>
  )
}

export default MedalCard
