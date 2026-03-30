'use client'

import AlertAsset from '@eveworld/ui-components/assets/alert.svg'
import EveButton from '@eveworld/ui-components/components/EveButton'
import EveLinearBar from '@eveworld/ui-components/components/EveLinearBar'
import { useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit'
import { isValidSuiObjectId } from '@mysten/sui/utils'
import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard'
import useNetworkType from '@suiware/kit/useNetworkType'
import useTransact from '@suiware/kit/useTransact'
import {
  BadgeCheckIcon,
  DatabaseIcon,
  FlaskConicalIcon,
  RadarIcon,
  WaypointsIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import CustomConnectButton from '~~/components/CustomConnectButton'
import Loading from '~~/components/Loading'
import OfficialActionButton from '~~/components/OfficialActionButton'
import {
  CONTRACT_PACKAGE_ID_NOT_DEFINED,
  CONTRACT_PACKAGE_VARIABLE_NAME,
  EXPLORER_URL_VARIABLE_NAME,
} from '~~/config/network'
import { notification } from '~~/helpers/notification'
import { packageUrl, transactionUrl } from '~~/helpers/network'
import useNetworkConfig from '~~/hooks/useNetworkConfig'
import type { ChronicleMedalState } from '../types'
import useChronicleSnapshot from '../hooks/useChronicleSnapshot'
import {
  prepareClaimMedalTransaction,
  prepareMintMedalNftTransaction,
} from '../helpers/transactions'
import { buildMockSnapshot } from '../mock/mockSnapshot'
import {
  createMockMedalReceipt,
  type MockMedalTxAction,
  type MockMedalTxReceipt,
  runMockMedalTransaction,
} from '../mock/mockTransaction'
import { ENetwork } from '~~/types/ENetwork'
import MedalCard from './MedalCard'
import MockWalletConfirmDialog from './MockWalletConfirmDialog'
import MedalShareDialog from '~~/warrior/[walletAddress]/components/MedalShareDialog'

type EvidenceTone = 'martian' | 'amber' | 'steel'
type MedalGroup = {
  title: string
  description: string
  medals: ChronicleMedalState[]
  emptyText: string
}
type PendingMockAction = {
  action: MockMedalTxAction
  medal: ChronicleMedalState
  receipt: MockMedalTxReceipt
} | null

const DEMO_SPOTLIGHT_SLUG = 'galactic-courier'

const truncateMiddle = (value: string, prefix = 8, suffix = 6) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`

const formatTimestamp = (
  value: string | null,
  locale: string,
  emptyLabel: string
) => {
  if (!value) {
    return emptyLabel
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const sortMedals = (medals: ChronicleMedalState[]) =>
  [...medals].sort((left, right) => {
    if (left.progressPercent !== right.progressPercent) {
      return right.progressPercent - left.progressPercent
    }

    return left.kind - right.kind
  })

const getMedalActionLabel = (
  medal: ChronicleMedalState,
  t: ReturnType<typeof useTranslations<'chronicleDashboard'>>
) => {
  if (medal.claimTicket) {
    return t('actions.claimMedal')
  }

  if (!medal.claimed && medal.unlocked && medal.templateObjectId) {
    return t('actions.mintMedal')
  }

  return null
}

const getMedalActionKind = (medal: ChronicleMedalState): MockMedalTxAction | null => {
  if (medal.claimTicket) {
    return 'claim'
  }

  if (!medal.claimed && medal.unlocked && medal.templateObjectId) {
    return 'mint'
  }

  return null
}

const ChronicleDashboard = ({ isMockMode = false }: { isMockMode?: boolean }) => {
  const locale = useLocale()
  const t = useTranslations('chronicleDashboard')
  const currentAccount = useCurrentAccount()
  const { currentWallet } = useCurrentWallet()
  const { networkType } = useNetworkType()
  const {
    data: rawData,
    error: rawError,
    isPending,
    refetch,
    network: rawNetwork,
  } = useChronicleSnapshot(currentAccount?.address, networkType)
  const { useNetworkVariable } = useNetworkConfig()
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const isPackageConfigured =
    packageId !== CONTRACT_PACKAGE_ID_NOT_DEFINED &&
    isValidSuiObjectId(packageId)
  const [notificationId, setNotificationId] = useState<string>()
  const [claimingSlug, setClaimingSlug] = useState<string | null>(null)
  const [shareSlug, setShareSlug] = useState<string | null>(null)
  const [mockTransactions, setMockTransactions] = useState<
    Record<string, MockMedalTxReceipt>
  >({})
  const [mockReceipts, setMockReceipts] = useState<Record<string, MockMedalTxReceipt>>(
    {}
  )
  const [pendingMockAction, setPendingMockAction] = useState<PendingMockAction>(null)
  const [localClaimedSlugs, setLocalClaimedSlugs] = useState<Set<string>>(
    new Set()
  )
  const announcedClaimablesRef = useRef<string>('')

  // ── Mock mode overrides ───────────────────────────────────────────────────
  const mockSnapshot = useMemo(() => {
    if (!isMockMode || !currentAccount?.address) return null
    return buildMockSnapshot(
      currentAccount.address,
      networkType as ENetwork,
      localClaimedSlugs
    )
  }, [isMockMode, currentAccount?.address, networkType, localClaimedSlugs])

  const data = isMockMode ? mockSnapshot : rawData
  const error = isMockMode ? null : rawError
  const network = isMockMode ? (networkType as ENetwork) : rawNetwork

  const { transact } = useTransact({
    onSuccess: (result: SuiSignAndExecuteTransactionOutput) => {
      if (result.digest) {
        notification.txSuccess(
          transactionUrl(explorerUrl, result.digest),
          notificationId
        )
      }

      setClaimingSlug(null)
      refetch()
    },
    onError: (transactionError: Error) => {
      notification.txError(transactionError, null, notificationId)
      setClaimingSlug(null)
    },
  })

  useEffect(() => {
    if (isMockMode || !data) {
      announcedClaimablesRef.current = ''
      return
    }

    const claimableKey = data.medals
      .filter((medal) => medal.claimable)
      .map((medal) => medal.slug)
      .sort()
      .join(',')

    if (!claimableKey || claimableKey === announcedClaimablesRef.current) {
      return
    }

    notification.success(t('toast.newClaimable'))
    announcedClaimablesRef.current = claimableKey
  }, [data, isMockMode, t])

  const runMockMedalFlow = async (
    medal: ChronicleMedalState,
    action: MockMedalTxAction,
    initialReceipt: MockMedalTxReceipt
  ) => {
    const nextNotificationId = notification.txLoading()
    setNotificationId(nextNotificationId)
    setClaimingSlug(medal.slug)
    setMockReceipts((prev) => {
      if (!prev[medal.slug]) {
        return prev
      }

      const next = { ...prev }
      delete next[medal.slug]
      return next
    })

    try {
      const receipt = await runMockMedalTransaction({
        slug: medal.slug,
        action,
        medalTitle: medal.title,
        receipt: initialReceipt,
        onUpdate: (nextReceipt) => {
          setMockTransactions((prev) => ({
            ...prev,
            [medal.slug]: nextReceipt,
          }))
        },
      })

      notification.txSuccess(`#${receipt.digest}`, nextNotificationId)
      setMockTransactions((prev) => {
        const next = { ...prev }
        delete next[medal.slug]
        return next
      })
      setMockReceipts((prev) => ({
        ...prev,
        [medal.slug]: receipt,
      }))
      setClaimingSlug(null)
      setLocalClaimedSlugs((prev) => new Set([...prev, medal.slug]))

      if (medal.slug === DEMO_SPOTLIGHT_SLUG) {
        notification.success(t('toast.mockMintReady'))
      }
    } catch (error) {
      setMockTransactions((prev) => {
        const next = { ...prev }
        delete next[medal.slug]
        return next
      })
      setClaimingSlug(null)
      notification.txError(error as Error, null, nextNotificationId)
    }
  }

  const handleClaim = (slug: string) => {
    if (!data) {
      return
    }

    const medal = data.medals.find((item) => item.slug === slug)

    if (!medal) {
      notification.error(null, t('errors.missingMedalConfig'))
      return
    }

    if (isMockMode) {
      setPendingMockAction({
        medal,
        action: 'claim',
        receipt: createMockMedalReceipt({
          slug: medal.slug,
          action: 'claim',
          medalTitle: medal.title,
          walletAddress: currentAccount?.address,
        }),
      })
      return
    }

    if (!isPackageConfigured) {
      notification.error(
        null,
        t('errors.packageMissing')
      )
      return
    }

    if (!data.profile.registryObjectId) {
      notification.error(
        null,
        t('errors.registryMissing')
      )
      return
    }

    if (!medal.claimTicket) {
      notification.error(null, t('errors.claimTicketMissing'))
      return
    }

    const nextNotificationId = notification.txLoading()
    setNotificationId(nextNotificationId)
    setClaimingSlug(medal.slug)
    transact(
      prepareClaimMedalTransaction(
        packageId,
        data.profile.registryObjectId,
        medal.claimTicket
      )
    )
  }

  const handleMint = (slug: string) => {
    if (!data) {
      return
    }

    const medal = data.medals.find((item) => item.slug === slug)

    if (!medal) {
      notification.error(null, t('errors.missingMedalConfig'))
      return
    }

    if (isMockMode) {
      setPendingMockAction({
        medal,
        action: 'mint',
        receipt: createMockMedalReceipt({
          slug: medal.slug,
          action: 'mint',
          medalTitle: medal.title,
          walletAddress: currentAccount?.address,
        }),
      })
      return
    }

    if (!isPackageConfigured) {
      notification.error(
        null,
        t('errors.packageMissing')
      )
      return
    }

    if (!data.profile.registryObjectId) {
      notification.error(
        null,
        t('errors.registryMissing')
      )
      return
    }

    if (!medal.templateObjectId) {
      notification.error(null, t('errors.templateMissing'))
      return
    }

    const nextNotificationId = notification.txLoading()
    setNotificationId(nextNotificationId)
    setClaimingSlug(medal.slug)
    transact(
      prepareMintMedalNftTransaction(
        packageId,
        data.profile.registryObjectId,
        medal.templateObjectId
      )
    )
  }

  if (!currentAccount) {
    return (
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-2">
        <div className="sds-panel rounded-[2rem] px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
                {t('connect.eyebrow')}
              </div>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                {t('connect.title')}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f4efe2]/72 sm:text-lg">
                {t('connect.body')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <CustomConnectButton />
              <span className="border border-white/10 bg-black/16 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#f4efe2]/68">
                {t('connect.chip')}
              </span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (isPending && !data) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="rounded-[1.8rem] border border-[#f04e3e]/32 bg-[#241211]/82 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#ffb2a6]">
            {t('error.eyebrow')}
            </div>
            <div className="mt-3 font-display text-3xl uppercase tracking-[0.08em] text-[#ffe3df]">
            {t('error.title')}
            </div>
          <p className="mt-3 text-sm leading-7 text-[#ffd2cb]">
            {error.message}
          </p>
          <div className="mt-5">
            <EveButton
              typeClass="primary"
              className="!self-auto"
              onClick={() => refetch()}
            >
              {t('error.retry')}
            </EveButton>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const claimableMedals = sortMedals(
    data.medals.filter((medal) => medal.claimable)
  )
  const claimedMedals = sortMedals(data.medals.filter((medal) => medal.claimed))
  const inProgressMedals = sortMedals(
    data.medals.filter((medal) => !medal.claimable && !medal.claimed)
  )

  const medalGroups: MedalGroup[] = [
    {
      title: t('groups.ready.title'),
      description: t('groups.ready.description'),
      medals: claimableMedals,
      emptyText: t('groups.ready.empty'),
    },
    {
      title: t('groups.progress.title'),
      description: t('groups.progress.description'),
      medals: inProgressMedals,
      emptyText: t('groups.progress.empty'),
    },
    {
      title: t('groups.bound.title'),
      description: t('groups.bound.description'),
      medals: claimedMedals,
      emptyText: t('groups.bound.empty'),
    },
  ]

  const infrastructureComplete =
    data.metrics.networkNodeAnchors >= 1 || data.metrics.storageUnitAnchors >= 3
  const shareMedal =
    shareSlug == null ? null : data.medals.find((medal) => medal.slug === shareSlug) ?? null

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-2">
      {isMockMode && (
        <div className="overflow-hidden border border-[#d9a441]/42 bg-[linear-gradient(135deg,rgba(217,164,65,0.16),rgba(22,16,7,0.92),rgba(7,8,11,0.96))] shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
            <div className="flex gap-3">
              <FlaskConicalIcon className="mt-1 h-5 w-5 shrink-0 text-[#d9a441]" />
              <div>
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f7d58a]">
                  {t('mock.eyebrow')}
                </div>
                <div className="mt-3 font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
                  {t('mock.title')}
                </div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#f4efe2]/68">
                  {t('mock.body')}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                [t('mock.steps.one.time'), t('mock.steps.one.title'), t('mock.steps.one.detail')],
                [t('mock.steps.two.time'), t('mock.steps.two.title'), t('mock.steps.two.detail')],
                [t('mock.steps.three.time'), t('mock.steps.three.title'), t('mock.steps.three.detail')],
              ].map(([time, title, detail]) => (
                <div
                  key={title}
                  className="border border-white/10 bg-black/18 px-4 py-4"
                >
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#f7d58a]">
                    {time}
                  </div>
                  <div className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f4efe2]">
                    {title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#f4efe2]/62">
                    {detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="sds-panel rounded-[2rem] px-6 py-7 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {isMockMode && (
              <StatusPill tone="amber">{t('status.mockMode')}</StatusPill>
            )}
            <StatusPill tone={data.profile.scanMode === 'authenticated' ? 'success' : 'amber'}>
              {data.profile.scanMode === 'authenticated'
                ? t('status.deepScan')
                : t('status.previewScan')}
            </StatusPill>
            <StatusPill tone="steel">{(network ?? '…').toUpperCase()}</StatusPill>
            <StatusPill tone={claimableMedals.length > 0 ? 'martian' : 'steel'}>
              {claimableMedals.length > 0
                ? t('status.readyNow', { count: claimableMedals.length })
                : t('status.noActiveClaim')}
            </StatusPill>
          </div>

          <h1 className="mt-6 font-display text-5xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-6xl">
            {t('hero.title')}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#f4efe2]/72">
            {t('hero.body')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SignalMetric
              icon={<BadgeCheckIcon className="h-4 w-4" />}
              label={t('metrics.claimReady.label')}
              value={claimableMedals.length > 0 ? `${claimableMedals.length}` : '0'}
              detail={
                claimableMedals.length > 0
                  ? t('metrics.claimReady.ready')
                  : t('metrics.claimReady.empty')
              }
            />
            <SignalMetric
              icon={<RadarIcon className="h-4 w-4" />}
              label={t('metrics.indexedPages.label')}
              value={String(data.profile.scannedPages)}
              detail={
                data.profile.scanLimitReached
                  ? t('metrics.indexedPages.limited')
                  : t('metrics.indexedPages.complete')
              }
            />
            <SignalMetric
              icon={<WaypointsIcon className="h-4 w-4" />}
              label={t('metrics.lastTrace.label')}
              value={formatTimestamp(
                data.profile.lastActivityAt,
                locale,
                t('metrics.lastTrace.emptyValue')
              )}
              detail={t('metrics.lastTrace.detail')}
            />
          </div>

          {claimableMedals.length > 0 ? (
            <div className="mt-6 border border-[#f0642f]/28 bg-[linear-gradient(135deg,rgba(240,100,47,0.16),rgba(10,10,11,0.92))] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#ffcfbf]">
                    {t('recommendation.eyebrow')}
                  </div>
                  <div className="mt-3 text-base font-semibold text-[#fef0ea]">
                    {t('recommendation.body')}
                  </div>
                </div>
                <OfficialActionButton
                  className="!min-w-[11rem]"
                  targetId="ready-to-claim"
                  typeClass="primary"
                >
                  {t('recommendation.cta')}
                </OfficialActionButton>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="sds-panel rounded-[2rem] px-6 py-6">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
            {t('manifest.eyebrow')}
          </div>

          <div className="mt-5 space-y-3">
            <ManifestRow label={t('manifest.wallet')}>
              {truncateMiddle(currentAccount.address)}
            </ManifestRow>
            <ManifestRow label={t('manifest.walletName')}>
              {currentWallet?.name || t('manifest.unknownWallet')}
            </ManifestRow>
            <ManifestRow label={t('manifest.characterId')}>
              {data.profile.characterId
                ? truncateMiddle(data.profile.characterId, 10, 8)
                : t('manifest.noCharacter')}
            </ManifestRow>
            <ManifestRow label={t('manifest.observedNetwork')}>
              {data.profile.observedNetwork || t('manifest.noObservedNetwork')}
            </ManifestRow>
            <ManifestRow label={t('manifest.worldPackage')}>
              {data.profile.evePackageId
                ? truncateMiddle(data.profile.evePackageId, 10, 8)
                : t('manifest.noWorldPackage')}
            </ManifestRow>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <CompactMetric
              label={t('compact.killmail')}
              value={data.metrics.killmailAttacks}
            />
            <CompactMetric
              label={t('compact.nodeAnchors')}
              value={data.metrics.networkNodeAnchors}
            />
            <CompactMetric
              label={t('compact.storageAnchors')}
              value={data.metrics.storageUnitAnchors}
            />
            <CompactMetric label={t('compact.gateJumps')} value={data.metrics.gateJumps} />
          </div>

          {isPackageConfigured ? (
            <div className="mt-6 text-sm text-[#f4efe2]/68">
              <OfficialActionButton
                className="!text-xs"
                href={packageUrl(explorerUrl, packageId)}
                icon="external"
                typeClass="ghost"
              >
                {t('manifest.packageExplorer')}
              </OfficialActionButton>
            </div>
          ) : null}
        </aside>
      </div>

      {data.warnings.length > 0 ? (
        <div className="grid gap-3">
          {data.warnings.map((warning) => (
            <SystemNotice key={warning}>{warning}</SystemNotice>
          ))}
        </div>
      ) : null}

      <div className="sds-panel rounded-[2rem] px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
              {t('evidence.eyebrow')}
            </div>
            <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
              {t('evidence.title')}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/68">
            {t('evidence.body')}
          </p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          <EvidenceTrack
            tone="martian"
            icon={<BadgeCheckIcon className="h-5 w-5" />}
            label={t('tracks.combat.label')}
            current={data.metrics.killmailAttacks}
            target={5}
            progressLabel={t('tracks.combat.progress', { current: data.metrics.killmailAttacks })}
            detail={t('tracks.combat.detail')}
            verifiedLabel={t('tracks.verified')}
            trackingLabel={t('tracks.tracking')}
          />

          <InfrastructureTrack
            networkNodeAnchors={data.metrics.networkNodeAnchors}
            storageUnitAnchors={data.metrics.storageUnitAnchors}
            complete={infrastructureComplete}
            title={t('tracks.infrastructure.label')}
            verifiedLabel={t('tracks.verified')}
            trackingLabel={t('tracks.tracking')}
            nodeLabel={t('tracks.infrastructure.nodeLabel')}
            storageLabel={t('tracks.infrastructure.storageLabel')}
            detail={t('tracks.infrastructure.detail')}
          />

          <EvidenceTrack
            tone="steel"
            icon={<WaypointsIcon className="h-5 w-5" />}
            label={t('tracks.transit.label')}
            current={data.metrics.gateJumps}
            target={10}
            progressLabel={t('tracks.transit.progress', { current: data.metrics.gateJumps })}
            detail={t('tracks.transit.detail')}
            verifiedLabel={t('tracks.verified')}
            trackingLabel={t('tracks.tracking')}
          />
        </div>
      </div>

      {medalGroups.map((group) => (
        <section
          key={group.title}
          id={group.title === t('groups.ready.title') ? 'ready-to-claim' : undefined}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
              {group.title}
            </div>
            <p className="text-sm leading-7 text-[#f4efe2]/68">
              {group.description}
            </p>
          </div>

          {group.medals.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {group.medals.map((medal) => {
                const actionLabel = getMedalActionLabel(medal, t)
                const actionKind = getMedalActionKind(medal)

                return (
                  <MedalCard
                    key={medal.slug}
                    medal={medal}
                    isClaiming={claimingSlug === medal.slug}
                    actionLabel={actionLabel}
                    actionKind={actionKind}
                    mockTransaction={mockTransactions[medal.slug] ?? null}
                    mockReceipt={mockReceipts[medal.slug] ?? null}
                    onShare={
                      medal.claimed
                        ? () => setShareSlug(medal.slug)
                        : null
                    }
                    onAction={() =>
                      actionLabel === t('actions.claimMedal')
                        ? handleClaim(medal.slug)
                        : handleMint(medal.slug)
                    }
                  />
                )
              })}
            </div>
          ) : (
            <div className="border border-white/10 bg-black/14 px-5 py-5 text-sm leading-7 text-[#f4efe2]/66">
              {group.emptyText}
            </div>
          )}
        </section>
      ))}

      {shareMedal && currentAccount ? (
        <MedalShareDialog
          medal={shareMedal}
          walletAddress={currentAccount.address}
          network={network ?? ENetwork.TESTNET}
          isMockMode={isMockMode}
          mockReceipt={shareSlug ? mockReceipts[shareSlug] ?? null : null}
          onClose={() => setShareSlug(null)}
        />
      ) : null}

      <MockWalletConfirmDialog
        open={pendingMockAction != null}
        action={pendingMockAction?.action ?? null}
        medalTitle={pendingMockAction?.medal.title ?? null}
        walletAddress={currentAccount?.address ?? null}
        network={(network ?? ENetwork.TESTNET).toUpperCase()}
        receipt={pendingMockAction?.receipt ?? null}
        onClose={() => setPendingMockAction(null)}
        onConfirm={() => {
          if (!pendingMockAction) {
            return
          }

          const { medal, action, receipt } = pendingMockAction
          setPendingMockAction(null)
          void runMockMedalFlow(medal, action, receipt)
        }}
      />
    </section>
  )
}

const StatusPill = ({
  children,
  tone,
}: {
  children: string
  tone: 'martian' | 'steel' | 'amber' | 'success'
}) => {
  const toneClassName = {
    martian: 'border-[#f0642f]/34 bg-[#f0642f]/12 text-[#ffd2c2]',
    steel: 'border-[#8ea1ad]/30 bg-[#8ea1ad]/10 text-[#d8e2e8]',
    amber: 'border-[#d9a441]/32 bg-[#d9a441]/10 text-[#f3ddb0]',
    success: 'border-[#7ec38f]/30 bg-[#7ec38f]/10 text-[#d7f0dd]',
  }[tone]

  return (
    <span
      className={`border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.24em] ${toneClassName}`}
    >
      {children}
    </span>
  )
}

const SignalMetric = ({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode
  label: string
  value: string
  detail: string
}) => (
  <div className="border border-white/10 bg-black/14 px-4 py-4">
    <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#f4efe2]/42">
      {icon}
      <span>{label}</span>
    </div>
    <div className="mt-3 text-sm font-medium leading-6 text-[#f4efe2]">
      {value}
    </div>
    <div className="mt-2 text-sm leading-6 text-[#f4efe2]/62">
      {detail}
    </div>
  </div>
)

const ManifestRow = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="border border-white/10 bg-black/14 px-4 py-3">
    <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#f4efe2]/42">
      {label}
    </div>
    <div className="mt-2 text-sm font-medium text-[#f4efe2]">
      {children}
    </div>
  </div>
)

const CompactMetric = ({ label, value }: { label: string; value: number }) => (
  <div className="border border-white/10 bg-black/14 px-4 py-3">
    <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#f4efe2]/42">
      {label}
    </div>
    <div className="mt-2 font-display text-3xl uppercase tracking-[0.06em] text-[#f4efe2]">
      {value}
    </div>
  </div>
)

const SystemNotice = ({ children }: { children: ReactNode }) => (
  <div className="rounded-[1.4rem] border border-[#d9a441]/35 bg-[#2a2112]/72 px-4 py-4 text-sm leading-7 text-[#f9e3b2] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
    <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.32em]">
      <Image
        src={AlertAsset}
        alt=""
        width={16}
        height={16}
        className="h-4 w-4"
      />
      <span>system notice</span>
    </div>
    <div className="mt-2">{children}</div>
  </div>
)

const EvidenceTrack = ({
  tone,
  icon,
  label,
  current,
  target,
  progressLabel,
  detail,
  verifiedLabel,
  trackingLabel,
}: {
  tone: EvidenceTone
  icon: ReactNode
  label: string
  current: number
  target: number
  progressLabel: string
  detail: string
  verifiedLabel: string
  trackingLabel: string
}) => {
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((current / target) * 100))
  )
  const toneClassName = {
    martian: {
      shell:
        'border-[#f0642f]/28 bg-[linear-gradient(180deg,rgba(240,100,47,0.12),rgba(10,10,11,0.96))]',
      bar: 'from-[#f0642f] via-[#f18a64] to-[#f5c18d]',
      status: 'text-[#ffd2c2]',
    },
    amber: {
      shell:
        'border-[#d9a441]/28 bg-[linear-gradient(180deg,rgba(217,164,65,0.12),rgba(10,10,11,0.96))]',
      bar: 'from-[#c98f33] via-[#d9a441] to-[#e7c06c]',
      status: 'text-[#f5dfae]',
    },
    steel: {
      shell:
        'border-[#8ea1ad]/28 bg-[linear-gradient(180deg,rgba(142,161,173,0.12),rgba(10,10,11,0.96))]',
      bar: 'from-[#708895] via-[#8ea1ad] to-[#b1c1c9]',
      status: 'text-[#d8e2e8]',
    },
  }[tone]

  return (
    <article
      className={`overflow-hidden border px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] ${toneClassName.shell}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#f4efe2]/52">
          {icon}
          <span>{label}</span>
        </div>
        <div className={`text-sm font-semibold ${toneClassName.status}`}>
          {current >= target ? verifiedLabel : trackingLabel}
        </div>
      </div>
      <div className="mt-5 font-display text-4xl uppercase tracking-[0.06em] text-[#f4efe2]">
        {current}
        <span className="ml-2 text-lg text-[#f4efe2]/44">/ {target}</span>
      </div>
      <div className="mt-3 text-sm text-[#f4efe2]/74">
        <EveLinearBar nominator={current} denominator={target} />
      </div>
      <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#f4efe2]/44">
        {progressLabel} // {progressPercent}%
      </div>
      <p className="mt-4 text-sm leading-7 text-[#f4efe2]/72">{detail}</p>
    </article>
  )
}

const InfrastructureTrack = ({
  networkNodeAnchors,
  storageUnitAnchors,
  complete,
  title,
  verifiedLabel,
  trackingLabel,
  nodeLabel,
  storageLabel,
  detail,
}: {
  networkNodeAnchors: number
  storageUnitAnchors: number
  complete: boolean
  title: string
  verifiedLabel: string
  trackingLabel: string
  nodeLabel: string
  storageLabel: string
  detail: string
}) => (
  <article className="overflow-hidden border border-[#d9a441]/28 bg-[linear-gradient(180deg,rgba(217,164,65,0.12),rgba(10,10,11,0.96))] px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#f4efe2]/52">
        <DatabaseIcon className="h-5 w-5" />
        <span>{title}</span>
      </div>
      <div className="text-sm font-semibold text-[#f5dfae]">
        {complete ? verifiedLabel : trackingLabel}
      </div>
    </div>

    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div>
        <div className="font-display text-4xl uppercase tracking-[0.06em] text-[#f4efe2]">
          {networkNodeAnchors}
          <span className="ml-2 text-lg text-[#f4efe2]/44">/ 1</span>
        </div>
        <div className="mt-2 text-sm text-[#f4efe2]/74">
          <EveLinearBar nominator={networkNodeAnchors} denominator={1} />
        </div>
        <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#f4efe2]/44">
          {nodeLabel}
        </div>
      </div>

      <div>
        <div className="font-display text-4xl uppercase tracking-[0.06em] text-[#f4efe2]">
          {storageUnitAnchors}
          <span className="ml-2 text-lg text-[#f4efe2]/44">/ 3</span>
        </div>
        <div className="mt-2 text-sm text-[#f4efe2]/74">
          <EveLinearBar nominator={storageUnitAnchors} denominator={3} />
        </div>
        <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#f4efe2]/44">
          {storageLabel}
        </div>
      </div>
    </div>

    <p className="mt-4 text-sm leading-7 text-[#f4efe2]/72">
      {detail}
    </p>
  </article>
)

export default ChronicleDashboard
