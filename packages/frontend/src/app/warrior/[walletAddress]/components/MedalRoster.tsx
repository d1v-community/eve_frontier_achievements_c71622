'use client'

import { useState } from 'react'
import type { ChronicleMedalState } from '~~/chronicle/types'
import type { ENetwork } from '~~/types/ENetwork'
import MedalShareDialog from './MedalShareDialog'

interface MedalRosterProps {
  medals: ChronicleMedalState[]
  walletAddress: string
  network: ENetwork
}

const TONE_COLORS: Record<string, { active: string; glow: string }> = {
  crimson: { active: '#e63946', glow: 'rgba(230,57,70,0.35)' },
  azure: { active: '#7c919d', glow: 'rgba(124,145,157,0.35)' },
  teal: { active: '#4ecdc4', glow: 'rgba(78,205,196,0.35)' },
  amber: { active: '#d9a441', glow: 'rgba(217,164,65,0.35)' },
  steel: { active: '#8ea1ad', glow: 'rgba(142,161,173,0.35)' },
}

const MEDAL_TONE_MAP: Record<string, string> = {
  'bloodlust-butcher': 'crimson',
  'void-pioneer': 'azure',
  'galactic-courier': 'teal',
  'turret-sentry': 'amber',
  'assembly-pioneer': 'steel',
  'turret-anchor': 'amber',
  'ssu-trader': 'teal',
  'fuel-feeder': 'steel',
}

// SVG icons keyed by slug
const MedalIcon = ({ slug, active }: { slug: string; active: boolean }) => {
  const tone = MEDAL_TONE_MAP[slug] || 'steel'
  const { active: color, glow } = TONE_COLORS[tone]

  // Simple geometric icon per medal type
  const iconPath = {
    'bloodlust-butcher': 'M12 2 L22 8 L22 16 L12 22 L2 16 L2 8 Z',
    'void-pioneer': 'M12 2 L20 12 L12 22 L4 12 Z',
    'galactic-courier': 'M3 12 A9 9 0 1 0 21 12 A9 9 0 1 0 3 12 M12 6 L12 18 M6 12 L18 12',
    'turret-sentry': 'M12 2 L14 9 L22 9 L16 14 L18 22 L12 17 L6 22 L8 14 L2 9 L10 9 Z',
    'assembly-pioneer': 'M4 4 L20 4 L20 20 L4 20 Z M8 8 L16 8 L16 16 L8 16 Z',
    'turret-anchor': 'M12 3 L12 13 M8 9 L16 9 M6 13 L18 13 L19 21 L5 21 Z',
    'ssu-trader': 'M4 8 L20 8 L20 20 L4 20 Z M9 8 L9 4 L15 4 L15 8 M12 11 L12 17 M9 14 L15 14',
    'fuel-feeder': 'M10 3 L14 3 L14 6 L16 6 L16 21 L8 21 L8 6 L10 6 Z M10 10 L14 10 M10 15 L14 15',
  }[slug] || 'M12 2 L22 12 L12 22 L2 12 Z'

  return (
    <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
      <path
        d={iconPath}
        stroke={active ? color : 'rgba(255,255,255,0.2)'}
        strokeWidth="1.5"
        fill={active ? glow : 'transparent'}
        style={{ filter: active ? `drop-shadow(0 0 6px ${glow})` : 'none', transition: 'all 0.3s' }}
      />
    </svg>
  )
}

export default function MedalRoster({
  medals,
  walletAddress,
  network,
}: MedalRosterProps) {
  const [selectedMedal, setSelectedMedal] = useState<ChronicleMedalState | null>(
    null
  )

  return (
    <>
      <div className="flex w-full flex-col gap-3">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--sds-font-mono)' }}
        >
          Medal Record
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {medals.map((medal) => {
            const active = medal.claimed || medal.unlocked
            const tone = MEDAL_TONE_MAP[medal.slug] || 'steel'
            const { active: color } = TONE_COLORS[tone]

            return (
              <button
                key={medal.slug}
                type="button"
                className="flex flex-col items-center gap-1.5 bg-transparent p-0 text-left"
                title={`${medal.title} — ${medal.claimed ? 'Bound' : medal.unlocked ? 'Verified' : 'Locked'}`}
                disabled={!medal.claimed}
                onClick={() => medal.claimed && setSelectedMedal(medal)}
                style={{
                  cursor: medal.claimed ? 'pointer' : 'default',
                }}
              >
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: medal.claimed
                      ? `rgba(${hexToRgb(color)}, 0.1)`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${medal.claimed ? `rgba(${hexToRgb(color)}, 0.35)` : 'rgba(255,255,255,0.08)'}`,
                    opacity: active ? 1 : 0.4,
                    transition: 'all 0.3s',
                    boxShadow: medal.claimed
                      ? `0 0 0 1px rgba(${hexToRgb(color)}, 0.08), 0 10px 24px rgba(${hexToRgb(color)}, 0.16)`
                      : 'none',
                  }}
                >
                  <MedalIcon slug={medal.slug} active={medal.claimed} />
                </div>
                <span
                  className="max-w-[64px] text-center text-xs"
                  style={{
                    color: medal.claimed ? color : 'rgba(255,255,255,0.3)',
                    fontFamily: 'var(--sds-font-mono)',
                    fontSize: '9px',
                    lineHeight: 1.3,
                  }}
                >
                  {medal.subtitle}
                </span>
                <span
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--sds-font-mono)',
                    color: medal.claimed
                      ? '#7ec38f'
                      : medal.unlocked
                        ? '#d9a441'
                        : 'rgba(255,255,255,0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {medal.claimed ? 'BOUND' : medal.unlocked ? 'VERIFIED' : 'LOCKED'}
                </span>
                <span
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--sds-font-mono)',
                    color: medal.claimed ? 'rgba(240,100,47,0.72)' : 'transparent',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {medal.claimed ? 'Tap to share' : 'No share'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      {selectedMedal ? (
        <MedalShareDialog
          medal={selectedMedal}
          walletAddress={walletAddress}
          network={network}
          onClose={() => setSelectedMedal(null)}
        />
      ) : null}
    </>
  )
}

// Helper to convert hex to rgb triplet string
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255,255,255'
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}
