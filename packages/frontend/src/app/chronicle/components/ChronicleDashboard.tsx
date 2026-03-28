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
import type { ENetwork } from '~~/types/ENetwork'
import MedalCard from './MedalCard'
import MedalShareDialog from '~~/warrior/[walletAddress]/components/MedalShareDialog'

type EvidenceTone = 'martian' | 'amber' | 'steel'
type MedalGroup = {
  title: string
  description: string
  medals: ChronicleMedalState[]
  emptyText: string
}

const DEMO_SPOTLIGHT_SLUG = 'galactic-courier'

const truncateMiddle = (value: string, prefix = 8, suffix = 6) =>
  `${value.slice(0, prefix)}...${value.slice(-suffix)}`

const formatTimestamp = (value: string | null) => {
  if (!value) {
    return '暂时还没有被索引到的边境行为'
  }

  return new Intl.DateTimeFormat('zh-CN', {
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

const getMedalActionLabel = (medal: ChronicleMedalState) => {
  if (medal.claimTicket) {
    return 'Claim Medal'
  }

  if (!medal.claimed && medal.unlocked && medal.templateObjectId) {
    return 'Mint Medal'
  }

  return null
}

const ChronicleDashboard = ({ isMockMode = false }: { isMockMode?: boolean }) => {
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

    notification.success('发现新的链上成就，可以立即 Claim。')
    announcedClaimablesRef.current = claimableKey
  }, [data, isMockMode])

  // Simulates the on-chain claim flow with a fake 1.5s "transaction" delay.
  const runMockClaim = (slug: string) => {
    const nextNotificationId = notification.txLoading()
    setNotificationId(nextNotificationId)
    setClaimingSlug(slug)

    setTimeout(() => {
      const fakeDigest =
        'MOCK' + Math.random().toString(36).substring(2, 14).toUpperCase()
      notification.txSuccess(`#${fakeDigest}`, nextNotificationId)
      setClaimingSlug(null)
      setLocalClaimedSlugs((prev) => new Set([...prev, slug]))
      if (slug === DEMO_SPOTLIGHT_SLUG) {
        notification.success('星门拓荒者已完成 mock mint，下一步直接点 Share。')
      }
    }, 1500)
  }

  const handleClaim = (slug: string) => {
    if (isMockMode) {
      runMockClaim(slug)
      return
    }

    if (!data) {
      return
    }

    const medal = data.medals.find((item) => item.slug === slug)

    if (!medal) {
      notification.error(null, 'Medal configuration is missing')
      return
    }

    if (!isPackageConfigured) {
      notification.error(
        null,
        'Current network has no medals package configured'
      )
      return
    }

    if (!data.profile.registryObjectId) {
      notification.error(
        null,
        'Shared medal registry has not been discovered yet'
      )
      return
    }

    if (!medal.claimTicket) {
      notification.error(null, 'This achievement does not have a valid claim ticket')
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
    if (isMockMode) {
      runMockClaim(slug)
      return
    }

    if (!data) {
      return
    }

    const medal = data.medals.find((item) => item.slug === slug)

    if (!medal) {
      notification.error(null, 'Medal configuration is missing')
      return
    }

    if (!isPackageConfigured) {
      notification.error(
        null,
        'Current network has no medals package configured'
      )
      return
    }

    if (!data.profile.registryObjectId) {
      notification.error(
        null,
        'Shared medal registry has not been discovered yet'
      )
      return
    }

    if (!medal.templateObjectId) {
      notification.error(null, 'This medal has no active on-chain template')
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
                chronicle command deck
              </div>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                接上钱包，系统才知道该替谁写编年史。
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f4efe2]/72 sm:text-lg">
                钱包一连上，Chronicle 就会按当前网络拉取玩家快照，检查 Eve Eyes
                索引、链上 registry 和可 Claim 的 medals 状态。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <CustomConnectButton />
              <span className="border border-white/10 bg-black/16 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#f4efe2]/68">
                wallet in // proof out
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
            chronicle failure
          </div>
          <div className="mt-3 font-display text-3xl uppercase tracking-[0.08em] text-[#ffe3df]">
            扫描失败
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
              Retry Scan
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
      title: 'Ready To Claim',
      description: '这些奖章已经满足门槛，链上领取通道现在是亮的。',
      medals: claimableMedals,
      emptyText: '当前没有可立即领取的奖章。',
    },
    {
      title: 'In Progress',
      description: '门槛还没满，但系统已经在持续记录你的玩家轨迹。',
      medals: inProgressMedals,
      emptyText: '没有待推进的奖章，说明当前奖章要么已领，要么尚未初始化。',
    },
    {
      title: 'Already Bound',
      description: '这些资历已经绑定到当前钱包，不再只是页面状态。',
      medals: claimedMedals,
      emptyText: '当前钱包还没有已绑定的奖章。',
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
                  mock mode active
                </div>
                <div className="mt-3 font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
                  三步把演示打穿
                </div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#f4efe2]/68">
                  所有链上动作都被 mock 掉了，但视觉反馈、分享卡片和社交平台跳转都会真实发生，够你把整段产品叙事讲完。
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['20s', '点击 Mint Medal', '先点“星门拓荒者”卡片，把勋章铸出来。'],
                ['30s', '点击 Share Card', '弹出高冲击分享卡，切换 X / OG / Discord 尺寸。'],
                ['40s', '点击平台按钮', '直接打开 X、Telegram、Discord 的分享链接。'],
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
              <StatusPill tone="amber">Mock Mode</StatusPill>
            )}
            <StatusPill tone={data.profile.scanMode === 'authenticated' ? 'success' : 'amber'}>
              {data.profile.scanMode === 'authenticated'
                ? 'Deep Scan'
                : 'Preview Scan'}
            </StatusPill>
            <StatusPill tone="steel">{(network ?? '…').toUpperCase()}</StatusPill>
            <StatusPill tone={claimableMedals.length > 0 ? 'martian' : 'steel'}>
              {claimableMedals.length > 0
                ? `${claimableMedals.length} Ready Now`
                : 'No Active Claim'}
            </StatusPill>
          </div>

          <h1 className="mt-6 font-display text-5xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-6xl">
            pilot chronicle
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#f4efe2]/72">
            这里不只是列出 medals，而是把玩家在 Frontier 里的真实行为翻译成可解释的门槛、证据与链上领取状态。
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SignalMetric
              icon={<BadgeCheckIcon className="h-4 w-4" />}
              label="Claim Ready"
              value={claimableMedals.length > 0 ? `${claimableMedals.length}` : '0'}
              detail={
                claimableMedals.length > 0
                  ? '有奖章已经达到链上领取条件'
                  : '暂无新奖章可领取'
              }
            />
            <SignalMetric
              icon={<RadarIcon className="h-4 w-4" />}
              label="Indexed Pages"
              value={String(data.profile.scannedPages)}
              detail={
                data.profile.scanLimitReached
                  ? '索引页数已触碰当前扫描上限'
                  : '当前扫描范围内已完成索引'
              }
            />
            <SignalMetric
              icon={<WaypointsIcon className="h-4 w-4" />}
              label="Last Frontier Trace"
              value={formatTimestamp(data.profile.lastActivityAt)}
              detail="最近一次被 Chronicle 捕获到的 Frontier 行为"
            />
          </div>

          {claimableMedals.length > 0 ? (
            <div className="mt-6 border border-[#f0642f]/28 bg-[linear-gradient(135deg,rgba(240,100,47,0.16),rgba(10,10,11,0.92))] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#ffcfbf]">
                    active recommendation
                  </div>
                  <div className="mt-3 text-base font-semibold text-[#fef0ea]">
                    先去看 Ready To Claim 区域，别让已经达标的奖章躺着发霉。
                  </div>
                </div>
                <OfficialActionButton
                  className="!min-w-[11rem]"
                  targetId="ready-to-claim"
                  typeClass="primary"
                >
                  Open Claim Queue
                </OfficialActionButton>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="sds-panel rounded-[2rem] px-6 py-6">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
            pilot manifest
          </div>

          <div className="mt-5 space-y-3">
            <ManifestRow label="Wallet">
              {truncateMiddle(currentAccount.address)}
            </ManifestRow>
            <ManifestRow label="Wallet Name">
              {currentWallet?.name || 'Unknown Wallet'}
            </ManifestRow>
            <ManifestRow label="Character ID">
              {data.profile.characterId
                ? truncateMiddle(data.profile.characterId, 10, 8)
                : '暂时还没有角色映射'}
            </ManifestRow>
            <ManifestRow label="Observed Network">
              {data.profile.observedNetwork || '还没有被索引到的链路'}
            </ManifestRow>
            <ManifestRow label="World Package">
              {data.profile.evePackageId
                ? truncateMiddle(data.profile.evePackageId, 10, 8)
                : '未发现世界包地址'}
            </ManifestRow>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <CompactMetric
              label="Killmail"
              value={data.metrics.killmailAttacks}
            />
            <CompactMetric
              label="Node Anchors"
              value={data.metrics.networkNodeAnchors}
            />
            <CompactMetric
              label="Storage Anchors"
              value={data.metrics.storageUnitAnchors}
            />
            <CompactMetric label="Gate Jumps" value={data.metrics.gateJumps} />
          </div>

          {isPackageConfigured ? (
            <div className="mt-6 text-sm text-[#f4efe2]/68">
              <OfficialActionButton
                className="!text-xs"
                href={packageUrl(explorerUrl, packageId)}
                icon="external"
                typeClass="ghost"
              >
                Open Package Explorer
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
              indexed evidence
            </div>
            <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
              行为证据先展示，奖章状态后展示。
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/68">
            玩家先看懂系统到底抓到了哪些 Frontier 轨迹，再去决定要不要继续冲门槛，逻辑才顺。
          </p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          <EvidenceTrack
            tone="martian"
            icon={<BadgeCheckIcon className="h-5 w-5" />}
            label="Combat Trace"
            current={data.metrics.killmailAttacks}
            target={5}
            progressLabel={`${data.metrics.killmailAttacks} / 5 confirmed attacker records`}
            detail="击杀成就只认被索引器确认的 killmail attacker。"
          />

          <InfrastructureTrack
            networkNodeAnchors={data.metrics.networkNodeAnchors}
            storageUnitAnchors={data.metrics.storageUnitAnchors}
            complete={infrastructureComplete}
          />

          <EvidenceTrack
            tone="steel"
            icon={<WaypointsIcon className="h-5 w-5" />}
            label="Transit Ledger"
            current={data.metrics.gateJumps}
            target={10}
            progressLabel={`${data.metrics.gateJumps} / 10 verified gate jumps`}
            detail="跃迁次数是物流与航线活跃度最直观的 Frontier 信号。"
          />
        </div>
      </div>

      {medalGroups.map((group) => (
        <section
          key={group.title}
          id={group.title === 'Ready To Claim' ? 'ready-to-claim' : undefined}
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
                const actionLabel = getMedalActionLabel(medal)

                return (
                  <MedalCard
                    key={medal.slug}
                    medal={medal}
                    isClaiming={claimingSlug === medal.slug}
                    actionLabel={actionLabel}
                    onShare={
                      medal.claimed
                        ? () => setShareSlug(medal.slug)
                        : null
                    }
                    onAction={() =>
                      actionLabel === 'Claim Medal'
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
          onClose={() => setShareSlug(null)}
        />
      ) : null}
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
}: {
  tone: EvidenceTone
  icon: ReactNode
  label: string
  current: number
  target: number
  progressLabel: string
  detail: string
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
          {current >= target ? 'Verified' : 'Tracking'}
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
}: {
  networkNodeAnchors: number
  storageUnitAnchors: number
  complete: boolean
}) => (
  <article className="overflow-hidden border border-[#d9a441]/28 bg-[linear-gradient(180deg,rgba(217,164,65,0.12),rgba(10,10,11,0.96))] px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#f4efe2]/52">
        <DatabaseIcon className="h-5 w-5" />
        <span>Infrastructure Trace</span>
      </div>
      <div className="text-sm font-semibold text-[#f5dfae]">
        {complete ? 'Verified' : 'Tracking'}
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
          network node anchors
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
          storage unit anchors
        </div>
      </div>
    </div>

    <p className="mt-4 text-sm leading-7 text-[#f4efe2]/72">
      建设类奖章按“1 个 network node 或 3 个 storage unit”判定，满足任一条都算建设痕迹成立。
    </p>
  </article>
)

export default ChronicleDashboard
