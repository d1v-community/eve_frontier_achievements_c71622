import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheckIcon,
  DatabaseIcon,
  RadarIcon,
  ShieldCheckIcon,
  WaypointsIcon,
} from 'lucide-react'
import OfficialActionButton from '~~/components/OfficialActionButton'
import ChronicleDashboard from '~~/chronicle/components/ChronicleDashboard'
import CustomConnectButton from './components/CustomConnectButton'
import EnvironmentRequirements from './components/EnvironmentRequirements'
import NetworkSupportChecker from './components/NetworkSupportChecker'
import ScoreShowcase from './components/landing/ScoreShowcase'
import WarriorCallout from './components/landing/WarriorCallout'
import WowMomentShowcase from './components/landing/WowMomentShowcase'

type SignalTone = 'martian' | 'steel' | 'amber' | 'success'

const heroChips = [
  'Eve Eyes Indexed',
  'Sui Testnet',
  'Soulbound Medals',
] as const

const stepCards = [
  {
    index: '01',
    title: 'Connect Wallet',
    description: '用你的 Sui 钱包作为玩家身份锚点，系统只围绕这个地址建立 Chronicle 档案。',
    icon: ShieldCheckIcon,
  },
  {
    index: '02',
    title: 'Scan Activity',
    description: '把跃迁、锚定、击杀等行为从 Eve Eyes 拉成可解释的 Frontier 进度。',
    icon: RadarIcon,
  },
  {
    index: '03',
    title: 'Claim Medal',
    description: '只有达标的成就才允许链上领取，结果不是自述，而是明确可验证的资历。',
    icon: BadgeCheckIcon,
  },
] as const satisfies ReadonlyArray<{
  index: string
  title: string
  description: string
  icon: LucideIcon
}>

const previewStats = [
  {
    label: 'scan status',
    value: 'ready to analyze',
    detail: 'preview or wallet-linked runtime',
    tone: 'success',
  },
  {
    label: 'combat score',
    value: '4178',
    detail: 'normalized frontier standing',
    tone: 'martian',
  },
  {
    label: 'claimable',
    value: '2 medals',
    detail: 'threshold-complete achievements',
    tone: 'amber',
  },
  {
    label: 'network',
    value: 'testnet',
    detail: 'wallet-aligned default',
    tone: 'steel',
  },
] as const satisfies ReadonlyArray<{
  label: string
  value: string
  detail: string
  tone: SignalTone
}>

const activitySignals = [
  {
    title: 'Galactic Courier',
    subtitle: 'Transit Ledger',
    metric: '10 gate jumps',
    detail: '持续跃迁会被识别成物流与通勤行为，不再只是截图证明。',
    source: '`gate::jump` traces become the courier threshold.',
    tone: 'steel',
    icon: WaypointsIcon,
  },
  {
    title: 'Void Pioneer',
    subtitle: 'Structure Footprint',
    metric: '1 / 3 anchors',
    detail: '锚定 network node 或 storage unit，才说明你真的在边境留下基础设施。',
    source:
      '`network_node::anchor` and `storage_unit::anchor` feed the builder trace.',
    tone: 'amber',
    icon: DatabaseIcon,
  },
  {
    title: 'Bloodlust Butcher',
    subtitle: 'Combat Trace',
    metric: '5 confirmed attackers',
    detail: '只有被 killmail 确认的 attacker 记录，才会推进战斗奖章判定。',
    source: 'Confirmed attacker records drive combat medal readiness.',
    tone: 'martian',
    icon: BadgeCheckIcon,
  },
] as const satisfies ReadonlyArray<{
  title: string
  subtitle: string
  metric: string
  detail: string
  source: string
  tone: SignalTone
  icon: LucideIcon
}>

const trustCards = [
  {
    label: 'Data Source',
    title: 'Eve Eyes Chronicle',
    detail: '公开窗口可预览，带 key 时能拉更深历史，不是纯前端脑补数据。',
  },
  {
    label: 'Behavior Classes',
    title: 'Jump / Anchor / Combat',
    detail: '当前成就系统主要围绕跃迁、锚定和战斗确认三类行为展开。',
  },
  {
    label: 'Threshold Logic',
    title: 'Explainable Progress',
    detail: '每枚成就都对应明确门槛，玩家能看到差多少，而不是盯着灰按钮发呆。',
  },
  {
    label: 'On-chain Result',
    title: 'Sui Soulbound Medal',
    detail: '满足条件后才开放 Claim，把 Frontier 资历写成不可转让的链上身份。',
  },
] as const

const runtimeNotes = [
  '默认按 testnet 校验钱包网络，没指定就先走 testnet。',
  '没有 `EVE_EYES_API_KEY` 时会进入 preview mode，但依旧能解释进度。',
  '没有当前网络的 package ID 时，扫描正常显示，只是链上 Claim 禁用。',
] as const

const toneDotClasses: Record<SignalTone, string> = {
  martian: 'bg-[#f0642f] shadow-[0_0_0_0.24rem_rgba(240,100,47,0.16)]',
  steel: 'bg-[#8ea1ad] shadow-[0_0_0_0.24rem_rgba(142,161,173,0.16)]',
  amber: 'bg-[#d9a441] shadow-[0_0_0_0.24rem_rgba(217,164,65,0.16)]',
  success: 'bg-[#7ec38f] shadow-[0_0_0_0.24rem_rgba(126,195,143,0.16)]',
}

const toneCardClasses: Record<SignalTone, string> = {
  martian:
    'border-[#f0642f]/26 bg-[linear-gradient(180deg,rgba(240,100,47,0.12),rgba(10,10,11,0.96))]',
  steel:
    'border-[#8ea1ad]/24 bg-[linear-gradient(180deg,rgba(142,161,173,0.12),rgba(10,10,11,0.96))]',
  amber:
    'border-[#d9a441]/24 bg-[linear-gradient(180deg,rgba(217,164,65,0.12),rgba(10,10,11,0.96))]',
  success:
    'border-[#7ec38f]/24 bg-[linear-gradient(180deg,rgba(126,195,143,0.12),rgba(10,10,11,0.96))]',
}

function SectionEyebrow({ children, variant = 'default' }: { children: string; variant?: 'default' | 'ping' }) {
  if (variant === 'ping') {
    return (
      <div className="sds-eyebrow-accented sds-section-ping font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
        {children}
      </div>
    )
  }
  return (
    <div className="sds-eyebrow-accented font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
      {children}
    </div>
  )
}

function StepCard({
  index,
  title,
  description,
  icon: Icon,
}: {
  index: string
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <article className="sds-panel sds-reveal rounded-[1.8rem] px-5 py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#f0642f]">
          {index}
        </div>
        <div className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.04] text-[#f4efe2]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mt-7 font-display text-2xl uppercase tracking-[0.08em] text-[#f4efe2]">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-[#f4efe2]/68">
        {description}
      </p>
    </article>
  )
}

function HeroPreviewCard() {
  return (
    <div className="sds-panel sds-grid-overlay sds-scanline overflow-hidden rounded-[2rem] border">
      <span className="sds-bracket-tl" aria-hidden="true" />
      <span className="sds-bracket-tr" aria-hidden="true" />
      <span className="sds-bracket-bl" aria-hidden="true" />
      <span className="sds-bracket-br" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,100,47,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(142,161,173,0.14),transparent_32%)]" />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
              live preview
            </div>
            <h2 className="mt-3 max-w-md font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
              扫到什么、差多少、能不能领，一眼看清。
            </h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center border border-[#7ec38f]/28 bg-[#7ec38f]/10">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7ec38f] shadow-[0_0_0_0.3rem_rgba(126,195,143,0.16)]" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {previewStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`border px-4 py-4 ${toneCardClasses[stat.tone]}`}
              style={{ animationDelay: `${index * 90}ms` } as CSSProperties}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`sds-pulse-dot mt-1.5 h-2.5 w-2.5 rounded-full ${toneDotClasses[stat.tone]}`}
                />
                <div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#f4efe2]/44">
                    {stat.label}
                  </div>
                  <div className="mt-3 font-display text-2xl uppercase tracking-[0.08em] text-[#f4efe2]">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#f4efe2]/64">
                    {stat.detail}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border border-white/10 bg-black/18 px-4 py-4">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#f4efe2]/42">
            recent trace
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#f4efe2]">
                gate jump confirmed
              </div>
              <div className="mt-1 text-sm leading-6 text-[#f4efe2]/62">
                你的时间线一旦被识别，就会直接映射到成就进度和 Claim readiness。
              </div>
            </div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-[#f4efe2]/42">
              00:12 UTC
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AchievementCard({
  activity,
  index,
}: {
  activity: (typeof activitySignals)[number]
  index: number
}) {
  const Icon = activity.icon

  return (
    <article
      className={`sds-panel sds-reveal rounded-[1.9rem] border px-6 py-6 ${toneCardClasses[activity.tone]}`}
      style={{ animationDelay: `${index * 120}ms` } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#f4efe2]/52">
            {activity.subtitle}
          </div>
          <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.08em] text-[#f4efe2]">
            {activity.title}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.04] text-[#f4efe2]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-7 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#f4efe2]/58">
        {activity.metric}
      </div>

      <p className="mt-5 text-sm leading-7 text-[#f4efe2]/72">
        {activity.detail}
      </p>

      <div className="mt-6 border border-white/10 bg-black/14 px-4 py-4">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#f4efe2]/42">
          proof source
        </div>
        <div className="mt-3 text-sm leading-7 text-[#f4efe2]/82">
          {activity.source}
        </div>
      </div>
    </article>
  )
}

function TrustCard({
  label,
  title,
  detail,
}: {
  label: string
  title: string
  detail: string
}) {
  return (
    <article className="sds-panel sds-reveal rounded-[1.6rem] px-5 py-5">
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#f0642f]">
        {label}
      </div>
      <h3 className="mt-4 font-display text-2xl uppercase tracking-[0.08em] text-[#f4efe2]">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-[#f4efe2]/68">
        {detail}
      </p>
    </article>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const isMockMode = params['m'] === '1'
  return (
    <div className="relative pb-14">
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="sds-panel sds-grid-overlay overflow-hidden rounded-[2.4rem] border">
            <span className="sds-bracket-tl" aria-hidden="true" />
            <span className="sds-bracket-tr" aria-hidden="true" />
            <span className="sds-bracket-bl" aria-hidden="true" />
            <span className="sds-bracket-br" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,100,47,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(142,161,173,0.08),transparent_28%)]" />

            <div className="grid gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-10">
              <div className="flex flex-col justify-between">
                <div>
                  <SectionEyebrow>verified frontier identity</SectionEyebrow>
                  <h1 className="mt-6 max-w-3xl font-display text-5xl uppercase leading-[0.92] tracking-[0.08em] text-[#f4efe2] sm:text-6xl xl:text-7xl">
                    把你在 Frontier 的行为，变成可验证的链上资历。
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f4efe2]/72">
                    连接钱包后，系统会扫描你的跃迁、锚定、击杀记录，实时显示成就进度，
                    并在达标时开放链上勋章领取。
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <OfficialActionButton targetId="chronicle-command">
                    Connect Wallet &amp; Scan
                  </OfficialActionButton>
                  <OfficialActionButton targetId="wow-moment" typeClass="secondary">
                    Watch Wow Moment Flow
                  </OfficialActionButton>
                  <div className="sds-connect-button-container">
                    <CustomConnectButton />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {heroChips.map((chip) => (
                    <div key={chip} className="sds-system-chip">
                      {chip}
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="border border-white/10 bg-black/16 px-4 py-4">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#f4efe2]/44">
                      What happens next
                    </div>
                    <div className="mt-3 text-sm leading-7 text-[#f4efe2]/72">
                      先看系统已经认出了什么，再决定继续刷进度还是直接 Claim，首页不再逼玩家先研究一堆概念。
                    </div>
                  </div>
                  <div className="border border-white/10 bg-black/16 px-4 py-4">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#f4efe2]/44">
                      Product posture
                    </div>
                    <div className="mt-3 text-sm leading-7 text-[#f4efe2]/72">
                      这不是摆拍用的 Web3 海报页，而是围绕 Chronicle 扫描、链上勋章和玩家资历验证的作战入口。
                    </div>
                  </div>
                </div>
              </div>

              <HeroPreviewCard />
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="sds-panel rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <SectionEyebrow>How It Works</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  三步就够，别把玩家困在说明书里。
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/66">
                首页的任务是把流程讲直，而不是把系统复杂性全倒在用户脸上。先连钱包，再扫记录，再看能不能领。
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {stepCards.map((step, index) => (
                <div
                  key={step.index}
                  style={{ animationDelay: `${index * 100}ms` } as CSSProperties}
                >
                  <StepCard {...step} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="chronicle-command"
        className="scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <div className="sds-panel rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div>
                <SectionEyebrow variant="ping">Live Chronicle</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  这里才是玩家自己的实时编年史。
                </h2>
                <p className="mt-4 text-base leading-8 text-[#f4efe2]/72">
                  连上钱包之后，先看系统已经识别到哪些 Frontier 行为，
                  再决定继续刷进度、补条件，还是直接领取链上勋章。
                </p>

                <div className="mt-6 grid gap-2">
                  {runtimeNotes.map((note) => (
                    <div
                      key={note}
                      className="border border-white/10 bg-black/16 px-4 py-3 text-sm leading-6 text-[#f4efe2]/78"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-black/14 p-2">
                <ChronicleDashboard isMockMode={isMockMode} />
              </div>
            </div>
          </div>

          <EnvironmentRequirements />
          <NetworkSupportChecker />
        </div>
      </section>

      <WowMomentShowcase />

      <section
        id="achievements"
        className="scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="sds-panel rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7">
              <SectionEyebrow>Achievement Preview</SectionEyebrow>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                先让玩家看到自己在追什么，再谈规则细节。
              </h2>
              <p className="mt-5 text-base leading-8 text-[#f4efe2]/70">
                当前成就系统最容易理解的三条轨迹就是跃迁、锚定和击杀。
                首页只需要把目标、门槛和证据类型讲清，不需要堆满配置表。
              </p>
              <div className="mt-8 border border-white/10 bg-black/14 px-4 py-4">
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#f4efe2]/44">
                  Design objective
                </div>
                <p className="mt-3 text-sm leading-7 text-[#f4efe2]/72">
                  玩家在一分钟内回答三个问题：我被记录了什么、我还差多少、为什么现在能不能 Claim。
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {activitySignals.map((activity, index) => (
                <AchievementCard
                  key={activity.title}
                  activity={activity}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ScoreShowcase />

      <section
        id="proof-trust"
        className="scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="sds-panel rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <SectionEyebrow>Proof &amp; Trust</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  玩家最在乎的不是酷炫，而是凭什么信你。
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/66">
                这套系统必须把数据来源、行为类型、阈值逻辑和链上结果讲透。按钮为什么亮，为什么灰，首页都应该给出解释。
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-4">
              {trustCards.map((card) => (
                <TrustCard
                  key={card.label}
                  label={card.label}
                  title={card.title}
                  detail={card.detail}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <WarriorCallout />
    </div>
  )
}
