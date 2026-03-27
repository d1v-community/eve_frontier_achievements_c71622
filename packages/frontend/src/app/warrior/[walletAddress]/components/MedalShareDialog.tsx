'use client'

import { useEffect, useState } from 'react'
import type { ChronicleMedalState } from '~~/chronicle/types'
import { notification } from '~~/helpers/notification'
import type { ENetwork } from '~~/types/ENetwork'
import { buildMedalImagePath, buildMedalSharePath } from '~~/warrior/share'
import {
  copyShareValue,
  downloadShareAsset,
  openShareWindow,
} from '~~/warrior/shareClient'

type ImageVariant = 'opengraph' | 'twitter' | 'discord'

const VARIANT_LABELS: Record<ImageVariant, string> = {
  opengraph: 'OG · 1200×630',
  twitter: 'X · 1200×600',
  discord: 'Discord · 1200×675',
}

interface MedalShareDialogProps {
  medal: ChronicleMedalState
  walletAddress: string
  network: ENetwork
  onClose: () => void
}

export default function MedalShareDialog({
  medal,
  walletAddress,
  network,
  onClose,
}: MedalShareDialogProps) {
  const [previewVariant, setPreviewVariant] = useState<ImageVariant>('opengraph')

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
  const sharePath = buildMedalSharePath(walletAddress, medal.slug, network)
  const shareUrl = `${origin}${sharePath}`
  const shareText = `${medal.subtitle} is chain-bound in Frontier Chronicle on Sui ${network.toUpperCase()}.`

  const imageUrl = `${origin}${buildMedalImagePath(walletAddress, medal.slug, network, previewVariant)}`

  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/share-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medalSlug: medal.slug,
          platform,
          walletAddress,
        }),
      })
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  const handleCopy = async ({
    quiet = false,
  }: {
    quiet?: boolean
  } = {}) => {
    const copied = await copyShareValue(shareUrl)

    if (!copied) {
      notification.error(null, 'Failed to copy the medal link')
      return false
    }

    if (!quiet) {
      notification.success('Medal link copied to clipboard')
    }

    return true
  }

  const handleDownload = () => {
    downloadShareAsset({
      href: imageUrl,
      filename: `frontier-chronicle-${medal.slug}-${walletAddress.slice(2, 10)}-${previewVariant}.png`,
    })
  }

  const handleShareToX = () => {
    setPreviewVariant('twitter')
    trackShare('x')
    const target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    openShareWindow(target)
  }

  const handleShareToTelegram = () => {
    setPreviewVariant('opengraph')
    trackShare('telegram')
    const target = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    openShareWindow(target)
  }

  const handleShareToDiscord = async () => {
    setPreviewVariant('discord')
    const copied = await handleCopy({ quiet: true })

    if (!copied) {
      return
    }

    trackShare('discord')
    openShareWindow('https://discord.com/channels/@me')
    notification.success('Medal link copied. Paste it into Discord.')
  }

  return (
    <div
      className="bg-black/72 fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="sds-panel sds-grid-overlay relative w-full max-w-5xl overflow-hidden rounded-[2rem] border"
        style={{
          borderColor: 'rgba(240,100,47,0.16)',
          background:
            'linear-gradient(145deg, rgba(12,13,15,0.98) 0%, rgba(18,20,22,0.94) 100%)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close medal share dialog"
          onClick={onClose}
          className="text-white/62 absolute right-4 top-4 rounded-full border px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          Close
        </button>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <section className="flex flex-col justify-between gap-6">
            <div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
                medal share capsule
              </div>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2]">
                {medal.subtitle}
              </h2>
              <p className="mt-2 text-base tracking-[0.18em] text-white/60">
                {medal.title}
              </p>
              <p className="text-white/68 mt-5 max-w-xl text-sm leading-7">
                This share card links straight to the medal verification page.
                The destination page reloads Chronicle evidence and current Sui
                medal ownership for the target wallet.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: 'Copy Link',
                  onClick: () => void handleCopy(),
                  shell: 'rgba(240,100,47,0.12)',
                  border: 'rgba(240,100,47,0.3)',
                  color: '#f0642f',
                  variant: null,
                },
                {
                  label: 'Download Card',
                  onClick: handleDownload,
                  shell: 'rgba(124,145,157,0.12)',
                  border: 'rgba(124,145,157,0.24)',
                  color: '#d7e0e5',
                  variant: null,
                },
                {
                  label: 'Share to X',
                  onClick: handleShareToX,
                  shell: 'rgba(255,255,255,0.06)',
                  border: 'rgba(255,255,255,0.12)',
                  color: '#f4efe2',
                  variant: 'twitter' as ImageVariant,
                },
                {
                  label: 'Share to Telegram',
                  onClick: handleShareToTelegram,
                  shell: 'rgba(78,205,196,0.12)',
                  border: 'rgba(78,205,196,0.24)',
                  color: '#4ecdc4',
                  variant: 'opengraph' as ImageVariant,
                },
                {
                  label: 'Share to Discord',
                  onClick: () => void handleShareToDiscord(),
                  shell: 'rgba(142,161,173,0.12)',
                  border: 'rgba(142,161,173,0.24)',
                  color: '#8ea1ad',
                  variant: 'discord' as ImageVariant,
                },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  onMouseEnter={() => action.variant && setPreviewVariant(action.variant)}
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
              Scan the QR code on the card to reopen the live medal verification
              page. The page recalculates Chronicle evidence and current medal
              state instead of showing a static screenshot.
            </div>

            <div
              className="text-white/58 rounded-[1.2rem] border px-4 py-4 text-xs leading-7"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              Discord uses a safe fallback: the dialog copies the medal link
              first, then opens Discord so you can paste it directly into chat.
            </div>
          </section>

          <section
            className="flex flex-col gap-3 rounded-[1.6rem] border p-3"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex gap-2">
              {(Object.keys(VARIANT_LABELS) as ImageVariant[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPreviewVariant(v)}
                  className="rounded-full border px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
                  style={{
                    borderColor:
                      v === previewVariant
                        ? 'rgba(240,100,47,0.4)'
                        : 'rgba(255,255,255,0.1)',
                    background:
                      v === previewVariant
                        ? 'rgba(240,100,47,0.14)'
                        : 'rgba(255,255,255,0.03)',
                    color: v === previewVariant ? '#f0642f' : 'rgba(244,239,226,0.52)',
                  }}
                >
                  {VARIANT_LABELS[v]}
                </button>
              ))}
            </div>
            <img
              src={imageUrl}
              alt={`${medal.subtitle} share card preview — ${VARIANT_LABELS[previewVariant]}`}
              className="block h-auto w-full rounded-[1rem]"
            />
          </section>
        </div>
      </div>
    </div>
  )
}
