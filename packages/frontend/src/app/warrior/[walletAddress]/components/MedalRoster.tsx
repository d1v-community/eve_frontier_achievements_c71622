'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ChronicleMedalState } from '~~/chronicle/types'
import {
  createMockMedalReceipt,
  type MockMedalTxReceipt,
  runMockMedalTransaction,
} from '~~/chronicle/mock/mockTransaction'
import MockTransactionPanel from '~~/chronicle/components/MockTransactionPanel'
import MockWalletConfirmDialog from '~~/chronicle/components/MockWalletConfirmDialog'
import { withLocale } from '~~/i18n/pathnames'
import type { ENetwork } from '~~/types/ENetwork'
import { resolveMockClaimedSlugs } from '~~/warrior/share'
import MedalShareDialog from './MedalShareDialog'

interface MedalRosterProps {
  medals: ChronicleMedalState[]
  walletAddress: string
  network: ENetwork
  isMockMode?: boolean
}
type PendingMintAction = {
  medal: ChronicleMedalState
  receipt: MockMedalTxReceipt
} | null

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

// Spinning ring for minting animation
const MintingSpinner = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray="28 14"
      strokeLinecap="round"
      style={{
        animation: 'spin 0.9s linear infinite',
        transformOrigin: '12px 12px',
        opacity: 0.8,
      }}
    />
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </svg>
)

export default function MedalRoster({
  medals,
  walletAddress,
  network,
  isMockMode = false,
}: MedalRosterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations('medalRoster')
  const [selectedMedal, setSelectedMedal] = useState<ChronicleMedalState | null>(null)
  const [mintingSlug, setMintingSlug] = useState<string | null>(null)
  const [mockTransaction, setMockTransaction] = useState<MockMedalTxReceipt | null>(
    null
  )
  const [latestReceipt, setLatestReceipt] = useState<MockMedalTxReceipt | null>(null)
  const [mockReceipts, setMockReceipts] = useState<Record<string, MockMedalTxReceipt>>(
    {}
  )
  const [localClaimedSlugs, setLocalClaimedSlugs] = useState<Set<string>>(new Set())
  const [pendingMintAction, setPendingMintAction] = useState<PendingMintAction>(null)

  const isEffectivelyClaimed = (medal: ChronicleMedalState) =>
    medal.claimed || localClaimedSlugs.has(medal.slug)

  const getAllClaimedSlugs = (): string[] => {
    const fromUrl = resolveMockClaimedSlugs(searchParams.get('claimed') ?? undefined)
    return [...new Set([...fromUrl, ...Array.from(localClaimedSlugs)])]
  }

  const runMockMint = async (
    medal: ChronicleMedalState,
    receipt: MockMedalTxReceipt
  ) => {
    setMintingSlug(medal.slug)
    setMockTransaction(receipt)

    try {
      const finalizedReceipt = await runMockMedalTransaction({
        slug: medal.slug,
        action: 'mint',
        medalTitle: medal.title,
        receipt,
        onUpdate: (nextReceipt) => {
          setMockTransaction(nextReceipt)
        },
      })

      setMockTransaction(null)
      setLatestReceipt(finalizedReceipt)
      setMockReceipts((prev) => ({
        ...prev,
        [medal.slug]: finalizedReceipt,
      }))
      setMintingSlug(null)
      setLocalClaimedSlugs((prev) => new Set([...prev, medal.slug]))

      // Persist to URL so the state survives a refresh
      const claimed = resolveMockClaimedSlugs(searchParams.get('claimed') ?? undefined)
      const next = new URLSearchParams(searchParams.toString())
      next.set('claimed', [...new Set([...claimed, medal.slug])].join(','))
      router.replace(withLocale(locale, `/warrior/${walletAddress}?${next.toString()}`))

      // Open share dialog with the medal marked as claimed
      setSelectedMedal({ ...medal, claimed: true })
    } catch {
      setMockTransaction(null)
      setMintingSlug(null)
    }
  }

  const rosterTransaction = mockTransaction ?? latestReceipt

  return (
    <>
      <div className="flex w-full flex-col gap-3">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--sds-font-mono)' }}
        >
          {t('title')}
        </p>
        {isMockMode && rosterTransaction ? (
          <MockTransactionPanel
            receipt={rosterTransaction}
            isRunning={Boolean(mockTransaction)}
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          {medals.map((medal) => {
            const effectivelyClaimed = isEffectivelyClaimed(medal)
            const isMinting = mintingSlug === medal.slug
            const canMockMint =
              isMockMode &&
              medal.unlocked &&
              !effectivelyClaimed &&
              mintingSlug == null &&
              !isMinting
            const active = effectivelyClaimed || medal.unlocked
            const tone = MEDAL_TONE_MAP[medal.slug] || 'steel'
            const { active: color } = TONE_COLORS[tone]
            const receipt = mockReceipts[medal.slug]

            return (
              <button
                key={medal.slug}
                type="button"
                className="flex flex-col items-center gap-1.5 bg-transparent p-0 text-left"
                title={`${medal.title} — ${effectivelyClaimed ? t('status.bound') : medal.unlocked ? t('status.verified') : t('status.locked')}`}
                disabled={!effectivelyClaimed && !canMockMint}
                onClick={() => {
                  if (effectivelyClaimed) {
                    const receiptProof = receipt
                      ? `digest ${receipt.digest.slice(0, 14)}... · checkpoint #${receipt.checkpoint}`
                      : null

                    setSelectedMedal({
                      ...medal,
                      claimed: true,
                      proof: medal.proof
                        ? receiptProof
                          ? `${medal.proof} · ${receiptProof}`
                          : medal.proof
                        : receiptProof,
                    })
                  } else if (canMockMint) {
                    setPendingMintAction({
                      medal,
                      receipt: createMockMedalReceipt({
                        slug: medal.slug,
                        action: 'mint',
                        medalTitle: medal.title,
                        walletAddress,
                      }),
                    })
                  }
                }}
                style={{
                  cursor: effectivelyClaimed || canMockMint ? 'pointer' : 'default',
                }}
              >
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: effectivelyClaimed
                      ? `rgba(${hexToRgb(color)}, 0.1)`
                      : isMinting
                        ? `rgba(${hexToRgb(color)}, 0.06)`
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${effectivelyClaimed ? `rgba(${hexToRgb(color)}, 0.35)` : isMinting ? `rgba(${hexToRgb(color)}, 0.2)` : 'rgba(255,255,255,0.08)'}`,
                    opacity: active ? 1 : 0.4,
                    transition: 'all 0.3s',
                    boxShadow: effectivelyClaimed
                      ? `0 0 0 1px rgba(${hexToRgb(color)}, 0.08), 0 10px 24px rgba(${hexToRgb(color)}, 0.16)`
                      : 'none',
                  }}
                >
                  {isMinting ? (
                    <MintingSpinner color={color} />
                  ) : (
                    <MedalIcon slug={medal.slug} active={effectivelyClaimed} />
                  )}
                </div>
                <span
                  className="max-w-[64px] text-center text-xs"
                  style={{
                    color: effectivelyClaimed ? color : 'rgba(255,255,255,0.3)',
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
                    color: effectivelyClaimed
                      ? '#7ec38f'
                      : isMinting
                        ? color
                        : medal.unlocked
                          ? '#d9a441'
                          : 'rgba(255,255,255,0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {isMinting
                    ? t('status.minting')
                    : effectivelyClaimed
                      ? t('status.bound')
                      : medal.unlocked
                        ? t('status.verified')
                        : t('status.locked')}
                </span>
                <span
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--sds-font-mono)',
                    color: effectivelyClaimed
                      ? 'rgba(240,100,47,0.72)'
                      : canMockMint
                        ? 'rgba(240,100,47,0.55)'
                        : 'transparent',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {effectivelyClaimed
                    ? t('action.tapToShare')
                    : canMockMint
                      ? t('action.tapToMint')
                      : t('action.noShare')}
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
          isMockMode={isMockMode}
          mockClaimedSlugs={getAllClaimedSlugs()}
          mockReceipt={mockReceipts[selectedMedal.slug] ?? null}
          onClose={() => setSelectedMedal(null)}
        />
      ) : null}
      <MockWalletConfirmDialog
        open={pendingMintAction != null}
        action={pendingMintAction ? 'mint' : null}
        medalTitle={pendingMintAction?.medal.title ?? null}
        walletAddress={walletAddress}
        network={network.toUpperCase()}
        receipt={pendingMintAction?.receipt ?? null}
        onClose={() => setPendingMintAction(null)}
        onConfirm={() => {
          if (!pendingMintAction) {
            return
          }

          const { medal, receipt } = pendingMintAction
          setPendingMintAction(null)
          void runMockMint(medal, receipt)
        }}
      />
    </>
  )
}

// Helper to convert hex to rgb triplet string
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255,255,255'
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}
