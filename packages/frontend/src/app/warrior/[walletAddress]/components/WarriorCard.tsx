import type { ChronicleSnapshot } from '~~/chronicle/types'
import MedalRoster from './MedalRoster'
import ScoreMeter from './ScoreMeter'
import ShareButton from './ShareButton'

interface WarriorCardProps {
  snapshot: ChronicleSnapshot
}

const RANK_TONE_MAP: Record<
  string,
  { primary: string; bg: string; border: string }
> = {
  steel: {
    primary: '#8ea1ad',
    bg: 'rgba(142,161,173,0.06)',
    border: 'rgba(142,161,173,0.2)',
  },
  amber: {
    primary: '#d9a441',
    bg: 'rgba(217,164,65,0.06)',
    border: 'rgba(217,164,65,0.2)',
  },
  azure: {
    primary: '#7c919d',
    bg: 'rgba(124,145,157,0.06)',
    border: 'rgba(124,145,157,0.2)',
  },
  martian: {
    primary: '#f0642f',
    bg: 'rgba(240,100,47,0.06)',
    border: 'rgba(240,100,47,0.2)',
  },
  crimson: {
    primary: '#e63946',
    bg: 'rgba(230,57,70,0.06)',
    border: 'rgba(230,57,70,0.2)',
  },
}

const truncateAddress = (address: string) =>
  address.length > 16
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : address

export default function WarriorCard({ snapshot }: WarriorCardProps) {
  const { profile, medals, warriorScore } = snapshot
  const rank = warriorScore.rank
  const colors = RANK_TONE_MAP[rank.tone] || RANK_TONE_MAP.steel

  return (
    <div
      className="sds-panel relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #111315 0%, ${colors.bg} 100%)`,
        border: `1px solid ${colors.border}`,
        maxWidth: 680,
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      {/* Scanline decoration */}
      <div className="sds-scanline pointer-events-none" />

      {/* Header row */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div
            className="mb-1 text-xs uppercase tracking-widest"
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontFamily: 'var(--sds-font-mono)',
            }}
          >
            Frontier Chronicle · Warrior Profile
          </div>
          <h1
            className="text-3xl font-bold uppercase leading-tight tracking-wider"
            style={{
              color: colors.primary,
              fontFamily: 'var(--sds-font-display)',
            }}
          >
            {rank.title}
          </h1>
          <p
            className="mt-0.5 text-sm"
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--sds-font-mono)',
            }}
          >
            {rank.titleZh} · Tier {rank.tier}
          </p>
        </div>
        <ShareButton
          walletAddress={profile.walletAddress}
          network={profile.requestedNetwork}
          rankTitle={rank.title}
          rankTitleZh={rank.titleZh}
          score={warriorScore.displayScore}
          claimedMedalCount={warriorScore.claimedMedalCount}
          totalMedalCount={medals.length}
        />
      </div>

      {/* Score meter + identity row */}
      <div className="mb-8 flex flex-col items-center gap-8 sm:flex-row">
        <ScoreMeter score={warriorScore.displayScore} />

        <div className="flex w-full flex-1 flex-col gap-3">
          {/* Pilot manifest */}
          <div
            className="flex flex-col gap-2 rounded p-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'var(--sds-font-mono)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                WALLET
              </span>
              <span className="text-xs" style={{ color: '#f3ede2' }}>
                {truncateAddress(profile.walletAddress)}
              </span>
            </div>
            {profile.characterId && (
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  CHARACTER
                </span>
                <span className="text-xs" style={{ color: '#f3ede2' }}>
                  {profile.characterId}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                NETWORK
              </span>
              <span className="text-xs uppercase" style={{ color: '#f3ede2' }}>
                {profile.observedNetwork || profile.requestedNetwork}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                MEDALS BOUND
              </span>
              <span className="text-xs" style={{ color: colors.primary }}>
                {warriorScore.claimedMedalCount} / {medals.length}
                {warriorScore.hasFullSet && (
                  <span className="ml-2" style={{ color: '#7ec38f' }}>
                    ✦ FULL SET
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Rank description */}
          <p
            className="text-xs leading-relaxed"
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--sds-font-mono)',
              fontStyle: 'italic',
            }}
          >
            &ldquo;{rank.description}&rdquo;
          </p>
        </div>
      </div>

      {/* Medal roster */}
      <MedalRoster
        medals={medals}
        walletAddress={profile.walletAddress}
        network={profile.requestedNetwork}
      />

      {/* Footer watermark */}
      <div
        className="mt-6 flex items-center justify-between pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          className="text-xs"
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontFamily: 'var(--sds-font-mono)',
          }}
        >
          Frontier Chronicle · Verified on Sui
        </span>
        <span
          className="sds-system-chip px-2 py-0.5 text-xs"
          style={{ color: colors.primary, borderColor: colors.border }}
        >
          {profile.scanMode === 'authenticated' ? 'Deep Scan' : 'Preview Scan'}
        </span>
      </div>
    </div>
  )
}
