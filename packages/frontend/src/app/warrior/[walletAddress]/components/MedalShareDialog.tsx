'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import type { MockMedalTxReceipt } from '~~/chronicle/mock/mockTransaction'
import type { ChronicleMedalState } from '~~/chronicle/types'
import { notification } from '~~/helpers/notification'
import type { ENetwork } from '~~/types/ENetwork'
import { buildMedalImagePath, buildMedalSharePath, generateMedalShareText } from '~~/warrior/share'
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
  isMockMode?: boolean
  mockClaimedSlugs?: string[]
  mockReceipt?: MockMedalTxReceipt | null
  onClose: () => void
}

export default function MedalShareDialog({
  medal,
  walletAddress,
  network,
  isMockMode = false,
  mockClaimedSlugs,
  mockReceipt,
  onClose,
}: MedalShareDialogProps) {
  const [previewVariant, setPreviewVariant] = useState<ImageVariant>('opengraph')
  const locale = useLocale()
  const t = useTranslations('medalShareDialog')
  const mockT = useTranslations('mockFlow')
  const shareT = useTranslations('mockFlow.share')

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
  const mockOptions = isMockMode
    ? { mock: true, claimed: mockClaimedSlugs ?? [medal.slug] }
    : undefined
  const sharePath = buildMedalSharePath(walletAddress, medal.slug, network, {
    ...mockOptions,
    locale,
  })
  const shareUrl = `${origin}${sharePath}`
  const shareText = generateMedalShareText(medal.slug, medal.subtitle, locale)

  const imageUrl = `${origin}${buildMedalImagePath(
    walletAddress,
    medal.slug,
    network,
    previewVariant,
    {
      ...mockOptions,
      locale,
    }
  )}`
  const xShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
  const discordShareUrl = 'https://discord.com/channels/@me'
  const dialogBody = isMockMode ? shareT('body') : t('body')

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
      filename: `frontier-chronicle-${medal.slug}-${walletAddress.slice(2, 10)}-${previewVariant}.png`,
    })
  }

  const handleShareToX = () => {
    setPreviewVariant('twitter')
    trackShare('x')
    openShareWindow(xShareUrl)
  }

  const handleShareToTelegram = () => {
    setPreviewVariant('opengraph')
    trackShare('telegram')
    openShareWindow(telegramShareUrl)
  }

  const handleShareToDiscord = async () => {
    setPreviewVariant('discord')
    const copied = await handleCopy({ quiet: true })

    if (!copied) {
      return
    }

    trackShare('discord')
    openShareWindow(discordShareUrl)
    notification.success(t('toast.discordCopied'))
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

        <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <section className="flex flex-col justify-between gap-6">
            <div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
                {t('eyebrow')}
              </div>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2]">
                {medal.subtitle}
              </h2>
              <p className="mt-2 text-base tracking-[0.18em] text-white/60">
                {medal.title}
              </p>
              <p className="text-white/68 mt-5 max-w-xl text-sm leading-7">
                {dialogBody}
              </p>
            </div>

            {isMockMode ? (
              <div
                className="rounded-[1.2rem] border px-4 py-4"
                style={{
                  borderColor: 'rgba(240,100,47,0.16)',
                  background:
                    'linear-gradient(180deg, rgba(240,100,47,0.08), rgba(255,255,255,0.03))',
                }}
              >
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#f0642f]">
                  {shareT('eyebrow')}
                </div>
                <div className="mt-4 grid gap-3">
                  {([
                    'receiptLocked',
                    'assetPrepared',
                    'socialHandoff',
                  ] as const).map((step) => (
                    <div
                      key={step}
                      className="border border-white/10 bg-black/18 px-4 py-4"
                    >
                      <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#ffd2c2]">
                        {shareT(`steps.${step}.label`)}
                      </div>
                      <div className="mt-2 text-xs leading-6 text-[#f4efe2]/68">
                        {shareT(`steps.${step}.detail`, { medalTitle: medal.title })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: t('actions.copyLink'),
                  onClick: () => void handleCopy(),
                  shell: 'rgba(240,100,47,0.12)',
                  border: 'rgba(240,100,47,0.3)',
                  color: '#f0642f',
                  variant: null,
                },
                {
                  label: t('actions.downloadCard'),
                  onClick: handleDownload,
                  shell: 'rgba(124,145,157,0.12)',
                  border: 'rgba(124,145,157,0.24)',
                  color: '#d7e0e5',
                  variant: null,
                },
                {
                  label: t('actions.shareToX'),
                  onClick: handleShareToX,
                  shell: 'rgba(255,255,255,0.06)',
                  border: 'rgba(255,255,255,0.12)',
                  color: '#f4efe2',
                  variant: 'twitter' as ImageVariant,
                },
                {
                  label: t('actions.shareToTelegram'),
                  onClick: handleShareToTelegram,
                  shell: 'rgba(78,205,196,0.12)',
                  border: 'rgba(78,205,196,0.24)',
                  color: '#4ecdc4',
                  variant: 'opengraph' as ImageVariant,
                },
                {
                  label: t('actions.shareToDiscord'),
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
              {isMockMode ? shareT('notes.handoff') : t('notes.qr')}
            </div>

            <div
              className="text-white/58 rounded-[1.2rem] border px-4 py-4 text-xs leading-7"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {isMockMode ? shareT('notes.social') : t('notes.discord')}
            </div>

            <div
              className="rounded-[1.2rem] border px-4 py-4"
              style={{
                borderColor: 'rgba(240,100,47,0.16)',
                background:
                  'linear-gradient(180deg, rgba(240,100,47,0.08), rgba(255,255,255,0.03))',
              }}
            >
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#f0642f]">
                {isMockMode ? shareT('launchTitle') : t('shareLinks')}
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  [t('launchLinks.xIntent'), xShareUrl],
                  [t('launchLinks.telegramShare'), telegramShareUrl],
                  [t('launchLinks.discordPasteFlow'), discordShareUrl],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-white/10 bg-black/18 px-4 py-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#f4efe2]/76 transition-transform hover:-translate-y-0.5 hover:border-[#f0642f]/28 hover:text-[#f4efe2]"
                  >
                    {label}
                  </a>
                ))}
              </div>
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
            {isMockMode && mockReceipt ? (
              <div
                className="rounded-[1.2rem] border px-4 py-4"
                style={{
                  borderColor: 'rgba(240,100,47,0.16)',
                  background:
                    'linear-gradient(180deg, rgba(240,100,47,0.08), rgba(255,255,255,0.03))',
                }}
              >
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#f0642f]">
                  {shareT('receiptTitle')}
                </div>
                <div className="mt-4 grid gap-2 text-xs leading-6 text-[#f4efe2]/68 sm:grid-cols-2">
                  <div>
                    <span className="font-mono uppercase tracking-[0.14em] text-white/42">
                      {mockT('fields.digest')}
                    </span>{' '}
                    {mockReceipt.digest}
                  </div>
                  <div>
                    <span className="font-mono uppercase tracking-[0.14em] text-white/42">
                      {mockT('fields.checkpoint')}
                    </span>{' '}
                    #{mockReceipt.checkpoint}
                  </div>
                  <div>
                    <span className="font-mono uppercase tracking-[0.14em] text-white/42">
                      {mockT('fields.object')}
                    </span>{' '}
                    {mockReceipt.objectId.slice(0, 18)}...
                  </div>
                  <div>
                    <span className="font-mono uppercase tracking-[0.14em] text-white/42">
                      {shareT('receiptAction')}
                    </span>{' '}
                    {mockT(`actions.${mockReceipt.action}`)}
                  </div>
                </div>
              </div>
            ) : null}
            <img
              src={imageUrl}
              alt={t('previewAlt', {
                subtitle: medal.subtitle,
                variant: VARIANT_LABELS[previewVariant],
              })}
              className="block h-auto w-full rounded-[1rem]"
            />
          </section>
        </div>
      </div>
    </div>
  )
}
