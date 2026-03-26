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
} as const

const MedalCard = ({
  medal,
  isClaiming,
  onClaim,
}: {
  medal: ChronicleMedalState
  isClaiming: boolean
  onClaim: () => void
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
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-white/48">
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
          <span className="border border-white/10 bg-black/14 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/68">
            {status}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/74">{medal.teaser}</p>

      <div className="mt-6 border border-white/10 bg-black/14 px-4 py-4 text-sm leading-7 text-white/74">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/42">
          threshold
        </div>
        <div className="mt-3">{medal.requirement}</div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/58">
          <span>{medal.progressLabel}</span>
          <span>{medal.progressPercent}%</span>
        </div>

        <div className="mt-3 text-sm text-white/72">
          <EveLinearBar
            nominator={medal.progressCurrent}
            denominator={medal.progressTarget}
          />
        </div>
      </div>

      <div className="mt-5 border border-white/10 bg-black/14 px-4 py-4 text-sm leading-7 text-white/74">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/42">
          indexed evidence
        </div>
        <div className={`mt-3 text-sm leading-7 ${tone.accent}`}>
          {medal.proof || '系统还没有抓到足够的 Frontier 行为证据。'}
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-h-10 text-sm leading-7 text-white/68">
          {statusDetail}
        </div>

        {medal.claimable ? (
          <EveButton
            typeClass="primary"
            className="!min-w-[10.75rem] !self-auto"
            disabled={isClaiming}
            onClick={() => onClaim()}
          >
            {isClaiming ? 'Claiming...' : 'Claim Medal'}
          </EveButton>
        ) : (
          <div className="border border-white/10 bg-black/14 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/65">
            {medal.claimed ? 'Bound' : medal.unlocked ? 'Await Chain' : 'Locked'}
          </div>
        )}
      </div>
    </article>
  )
}

export default MedalCard
