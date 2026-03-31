'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { notification } from '~~/helpers/notification'
import type { ENetwork } from '~~/types/ENetwork'
import {
  buildWarriorImagePath,
  buildWarriorSharePath,
  generateWarriorShareText,
  getLocalizedWarriorRankSubtitle,
} from '~~/warrior/share'
import {
  copyShareValue,
  downloadShareAsset,
  openShareWindow,
} from '~~/warrior/shareClient'

type PreviewVariant = 'opengraph' | 'twitter'

interface WarriorShareDialogProps {
  walletAddress: string
  network: ENetwork
  rankTitle: string
  rankTitleZh: string
  score: number
  claimedMedalCount: number
  totalMedalCount: number
  onClose: () => void
}

export default function WarriorShareDialog({
  walletAddress,
  network,
  rankTitle,
  rankTitleZh,
  score,
  claimedMedalCount,
  totalMedalCount,
  onClose,
}: WarriorShareDialogProps) {
  const [variant, setVariant] = useState<PreviewVariant>('opengraph')
  const locale = useLocale()
  const t = useTranslations('warriorShareDialog')

  useEffect(() => {
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
  }, [onClose])

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const sharePath = buildWarriorSharePath(walletAddress, network, { locale })
  const imagePath = buildWarriorImagePath(walletAddress, network, variant, {
    locale,
  })
  const shareUrl = `${origin}${sharePath}`
  const imageUrl = `${origin}${imagePath}`

  const shareText = useMemo(
    () =>
      generateWarriorShareText({
        locale,
        rankTitle,
        rankTitleZh,
        score,
        claimedMedalCount,
        totalMedalCount,
        network,
      }),
    [
      claimedMedalCount,
      locale,
      network,
      rankTitle,
      rankTitleZh,
      score,
      totalMedalCount,
    ]
  )
  const localizedRankSubtitle = useMemo(
    () =>
      getLocalizedWarriorRankSubtitle({
        locale,
        rankTitle,
        rankTitleZh,
      }),
    [locale, rankTitle, rankTitleZh]
  )

  const handleCopy = async ({
    quiet = false,
  }: {
    quiet?: boolean
  } = {}) => {
    const copied = await copyShareValue(shareUrl)

    if (!copied) {
      notification.error(null, t('toast.copyFailed'))
      return false
    }

    if (!quiet) {
      notification.success(t('toast.copied'))
    }

    return true
  }

  const handleDownload = () => {
    downloadShareAsset({
      href: imageUrl,
      filename: `frontier-chronicle-${variant}-${network}-${walletAddress.slice(2, 10)}.png`,
    })
  }

  const handleShareToX = () => {
    const target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    openShareWindow(target)
  }

  const handleShareToTelegram = () => {
    const target = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    openShareWindow(target)
  }

  const handleShareToDiscord = async () => {
    const copied = await handleCopy({ quiet: true })

    if (!copied) {
      return
    }

    openShareWindow('https://discord.com/channels/@me')
    notification.success(t('toast.discordCopied'))
  }

  return (
    <div
      className="bg-black/76 fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="sds-panel sds-grid-overlay relative w-full max-w-6xl overflow-hidden rounded-[2rem] border"
        style={{
          borderColor: 'rgba(240,100,47,0.18)',
          background:
            'radial-gradient(circle at top left, rgba(240,100,47,0.18), transparent 28%), linear-gradient(145deg, rgba(9,10,12,0.98) 0%, rgba(14,16,18,0.96) 100%)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={t('closeAria')}
          onClick={onClose}
          className="text-white/62 absolute right-4 top-4 rounded-full border px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          {t('close')}
        </button>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
          <section className="flex flex-col justify-between gap-6">
            <div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
                {t('eyebrow')}
              </div>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                {rankTitle}
              </h2>
              <p className="mt-2 text-base tracking-[0.18em] text-white/60">
                {localizedRankSubtitle}
              </p>
              <p className="text-white/68 mt-5 max-w-xl text-sm leading-7">
                {t('body')}
              </p>
            </div>

            <div
              className="rounded-[1.25rem] border p-4"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="text-white/42 font-mono text-[0.62rem] uppercase tracking-[0.28em]">
                {t('previewFormat')}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  {
                    label: t('variants.opengraph.label'),
                    value: 'opengraph' as const,
                    hint: t('variants.opengraph.hint'),
                  },
                  {
                    label: t('variants.twitter.label'),
                    value: 'twitter' as const,
                    hint: t('variants.twitter.hint'),
                  },
                ].map((option) => {
                  const active = variant === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVariant(option.value)}
                      className="rounded-[1rem] border px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
                      style={{
                        minWidth: 180,
                        borderColor: active
                          ? 'rgba(240,100,47,0.32)'
                          : 'rgba(255,255,255,0.1)',
                        background: active
                          ? 'rgba(240,100,47,0.12)'
                          : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div
                        className="font-mono text-[0.68rem] uppercase tracking-[0.22em]"
                        style={{ color: active ? '#f0642f' : '#f4efe2' }}
                      >
                        {option.label}
                      </div>
                      <div className="text-white/52 mt-2 text-xs leading-6">
                        {option.hint}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: t('actions.copyLink'),
                  onClick: () => void handleCopy(),
                  shell: 'rgba(240,100,47,0.12)',
                  border: 'rgba(240,100,47,0.3)',
                  color: '#f0642f',
                },
                {
                  label: t('actions.downloadCard'),
                  onClick: handleDownload,
                  shell: 'rgba(124,145,157,0.12)',
                  border: 'rgba(124,145,157,0.24)',
                  color: '#d7e0e5',
                },
                {
                  label: t('actions.shareToX'),
                  onClick: handleShareToX,
                  shell: 'rgba(255,255,255,0.06)',
                  border: 'rgba(255,255,255,0.12)',
                  color: '#f4efe2',
                },
                {
                  label: t('actions.shareToTelegram'),
                  onClick: handleShareToTelegram,
                  shell: 'rgba(78,205,196,0.12)',
                  border: 'rgba(78,205,196,0.24)',
                  color: '#4ecdc4',
                },
                {
                  label: t('actions.shareToDiscord'),
                  onClick: () => void handleShareToDiscord(),
                  shell: 'rgba(142,161,173,0.12)',
                  border: 'rgba(142,161,173,0.24)',
                  color: '#8ea1ad',
                },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="rounded-[1.1rem] border px-4 py-4 text-left font-mono text-[0.68rem] uppercase tracking-[0.22em] transition-transform hover:-translate-y-0.5"
                  style={{
                    background: action.shell,
                    borderColor: action.border,
                    color: action.color,
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div
              className="text-white/58 rounded-[1.2rem] border px-4 py-4 text-xs leading-7"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {t('notes.qr')}
            </div>

            <div
              className="text-white/58 rounded-[1.2rem] border px-4 py-4 text-xs leading-7"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {t('notes.discord')}
            </div>
          </section>

          <section
            className="rounded-[1.6rem] border p-3"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <img
              src={imageUrl}
              alt={t('previewAlt', { rankTitle })}
              className="block h-auto w-full rounded-[1rem]"
            />
          </section>
        </div>
      </div>
    </div>
  )
}
