import type {CSSProperties} from 'react'
import type {LucideIcon} from 'lucide-react'
import {
  BadgeCheckIcon,
  DatabaseIcon,
  RadarIcon,
  ShieldCheckIcon,
  WaypointsIcon,
} from 'lucide-react'
import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import OfficialActionButton from '~~/components/OfficialActionButton'
import ChronicleDashboard from '~~/chronicle/components/ChronicleDashboard'
import EnvironmentRequirements from './components/EnvironmentRequirements'
import NetworkSupportChecker from './components/NetworkSupportChecker'
import ScoreShowcase from './components/landing/ScoreShowcase'
import WarriorCallout from './components/landing/WarriorCallout'

type SignalTone = 'martian' | 'steel' | 'amber' | 'success'

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

function SectionEyebrow({children}: {children: string}) {
  return (
    <div className="sds-eyebrow-accented font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
      {children}
    </div>
  )
}

function HeroPreviewCard({
  previewStats,
  title,
  label,
  recentLabel,
  recentTitle,
  recentBody,
}: {
  previewStats: Array<{
    label: string
    value: string
    detail: string
    tone: SignalTone
  }>
  title: string
  label: string
  recentLabel: string
  recentTitle: string
  recentBody: string
}) {
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
              {label}
            </div>
            <h2 className="mt-3 max-w-md font-display text-3xl uppercase tracking-[0.08em] text-[#f4efe2]">
              {title}
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
              style={{animationDelay: `${index * 90}ms`} as CSSProperties}
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
            {recentLabel}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#f4efe2]">
                {recentTitle}
              </div>
              <div className="mt-1 text-sm leading-6 text-[#f4efe2]/62">
                {recentBody}
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

function InfoCard({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="border border-white/10 bg-black/16 px-4 py-4">
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#f4efe2]/44">
        {title}
      </div>
      <div className="mt-3 text-sm leading-7 text-[#f4efe2]/72">{body}</div>
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

function AchievementCard({
  activity,
  index,
  proofSourceLabel,
}: {
  activity: {
    title: string
    subtitle: string
    metric: string
    detail: string
    source: string
    tone: SignalTone
    icon: LucideIcon
  }
  index: number
  proofSourceLabel: string
}) {
  const Icon = activity.icon

  return (
    <article
      className={`sds-panel sds-reveal rounded-[1.9rem] border px-6 py-6 ${toneCardClasses[activity.tone]}`}
      style={{animationDelay: `${index * 120}ms`} as CSSProperties}
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
          {proofSourceLabel}
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

function DemoStepCard({
  step,
}: {
  step: {
    label: string
    title: string
    body: string
  }
}) {
  return (
    <article className="sds-panel rounded-[1.7rem] px-5 py-5">
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#f0642f]">
        {step.label}
      </div>
      <h3 className="mt-4 font-display text-2xl uppercase tracking-[0.08em] text-[#f4efe2]">
        {step.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-[#f4efe2]/68">{step.body}</p>
    </article>
  )
}

export async function getHomeMetadata(locale = 'en'): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'meta'})

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('socialDescription'),
    },
    twitter: {
      title: t('title'),
      description: t('socialDescription'),
    },
  }
}

export async function HomePage({
  isMockMode = false,
}: {
  isMockMode?: boolean
}) {
  const [t, mockT] = await Promise.all([
    getTranslations('home'),
    getTranslations('mockFlow'),
  ])

  const stepCards = [
    {
      index: '01',
      title: t('solution.steps.connectTitle'),
      description: t('solution.steps.connectDescription'),
      icon: ShieldCheckIcon,
    },
    {
      index: '02',
      title: t('solution.steps.scanTitle'),
      description: t('solution.steps.scanDescription'),
      icon: RadarIcon,
    },
    {
      index: '03',
      title: t('solution.steps.claimTitle'),
      description: t('solution.steps.claimDescription'),
      icon: BadgeCheckIcon,
    },
  ] as const

  const previewStats = [
    {
      label: t('previewStats.scanStatusLabel'),
      value: t('previewStats.scanStatusValue'),
      detail: t('previewStats.scanStatusDetail'),
      tone: 'success',
    },
    {
      label: t('previewStats.combatScoreLabel'),
      value: t('previewStats.combatScoreValue'),
      detail: t('previewStats.combatScoreDetail'),
      tone: 'martian',
    },
    {
      label: t('previewStats.claimableLabel'),
      value: t('previewStats.claimableValue'),
      detail: t('previewStats.claimableDetail'),
      tone: 'amber',
    },
    {
      label: t('previewStats.networkLabel'),
      value: t('previewStats.networkValue'),
      detail: t('previewStats.networkDetail'),
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
      title: t('activity.courierTitle'),
      subtitle: t('activity.courierSubtitle'),
      metric: t('activity.courierMetric'),
      detail: t('activity.courierDetail'),
      source: t('activity.courierSource'),
      tone: 'steel',
      icon: WaypointsIcon,
    },
    {
      title: t('activity.pioneerTitle'),
      subtitle: t('activity.pioneerSubtitle'),
      metric: t('activity.pioneerMetric'),
      detail: t('activity.pioneerDetail'),
      source: t('activity.pioneerSource'),
      tone: 'amber',
      icon: DatabaseIcon,
    },
    {
      title: t('activity.bloodlustTitle'),
      subtitle: t('activity.bloodlustSubtitle'),
      metric: t('activity.bloodlustMetric'),
      detail: t('activity.bloodlustDetail'),
      source: t('activity.bloodlustSource'),
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
      label: t('trust.cards.dataSourceLabel'),
      title: t('trust.cards.dataSourceTitle'),
      detail: t('trust.cards.dataSourceDetail'),
    },
    {
      label: t('trust.cards.behaviorLabel'),
      title: t('trust.cards.behaviorTitle'),
      detail: t('trust.cards.behaviorDetail'),
    },
    {
      label: t('trust.cards.thresholdLabel'),
      title: t('trust.cards.thresholdTitle'),
      detail: t('trust.cards.thresholdDetail'),
    },
    {
      label: t('trust.cards.chainLabel'),
      title: t('trust.cards.chainTitle'),
      detail: t('trust.cards.chainDetail'),
    },
  ] as const

  const demoSteps = [
    {
      label: t('demo.steps.oneLabel'),
      title: t('demo.steps.oneTitle'),
      body: t('demo.steps.oneBody'),
    },
    {
      label: t('demo.steps.twoLabel'),
      title: t('demo.steps.twoTitle'),
      body: t('demo.steps.twoBody'),
    },
    {
      label: t('demo.steps.threeLabel'),
      title: t('demo.steps.threeTitle'),
      body: t('demo.steps.threeBody'),
    },
  ]

  const chainLoopSteps = [
    {
      key: 'prepare',
      title: mockT('stages.mint.prepare.label'),
      body: mockT('home.steps.prepare'),
    },
    {
      key: 'sign',
      title: mockT('stages.mint.sign.label'),
      body: mockT('home.steps.sign'),
    },
    {
      key: 'submit',
      title: mockT('stages.mint.submit.label'),
      body: mockT('home.steps.submit'),
    },
    {
      key: 'finalize',
      title: mockT('stages.mint.finalize.label'),
      body: mockT('home.steps.finalize'),
    },
  ] as const

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
                  <SectionEyebrow>{t('hero.eyebrow')}</SectionEyebrow>
                  <h1 className="mt-6 max-w-3xl font-display text-5xl uppercase leading-[0.92] tracking-[0.08em] text-[#f4efe2] sm:text-6xl xl:text-7xl">
                    {t('hero.title')}
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f4efe2]/72">
                    {t('hero.subtitle')}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <OfficialActionButton targetId="chronicle-command">
                    {t('hero.primaryCta')}
                  </OfficialActionButton>
                  <OfficialActionButton targetId="demo-flow" typeClass="secondary">
                    {t('hero.secondaryCta')}
                  </OfficialActionButton>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {[
                    t('hero.chips.eveEyes'),
                    t('hero.chips.sui'),
                    t('hero.chips.cards'),
                  ].map((chip) => (
                    <div key={chip} className="sds-system-chip">
                      {chip}
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    title={t('hero.nextTitle')}
                    body={t('hero.nextBody')}
                  />
                  <InfoCard
                    title={t('hero.postureTitle')}
                    body={t('hero.postureBody')}
                  />
                </div>
              </div>

              <HeroPreviewCard
                previewStats={[...previewStats]}
                label={t('hero.previewLabel')}
                title={t('hero.previewTitle')}
                recentLabel={t('hero.previewRecentLabel')}
                recentTitle={t('hero.previewRecentTitle')}
                recentBody={t('hero.previewRecentBody')}
              />
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
                <SectionEyebrow>{t('solution.eyebrow')}</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {t('solution.title')}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/66">
                {t('solution.body')}
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {stepCards.map((step, index) => (
                <div
                  key={step.index}
                  style={{animationDelay: `${index * 100}ms`} as CSSProperties}
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
                <SectionEyebrow>{t('live.eyebrow')}</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {t('live.title')}
                </h2>
                <p className="mt-4 text-base leading-8 text-[#f4efe2]/72">
                  {t('live.body')}
                </p>

                <div className="mt-6 grid gap-2">
                  {[
                    t('live.notes.network'),
                    t('live.notes.preview'),
                    t('live.notes.claim'),
                  ].map((note) => (
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

      <section className="scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="sds-panel rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <SectionEyebrow>{mockT('home.eyebrow')}</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {mockT('home.title')}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/66">
                {mockT('home.body')}
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-4">
              {chainLoopSteps.map((step, index) => (
                <div
                  key={step.key}
                  style={{animationDelay: `${index * 100}ms`} as CSSProperties}
                >
                  <DemoStepCard
                    step={{
                      label: `${String(index + 1).padStart(2, '0')} · ${mockT(
                        'actions.mint'
                      )}`,
                      title: step.title,
                      body: step.body,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="achievements"
        className="scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="sds-panel rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7">
              <SectionEyebrow>{t('activity.eyebrow')}</SectionEyebrow>
              <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                {t('activity.title')}
              </h2>
              <p className="mt-5 text-base leading-8 text-[#f4efe2]/70">
                {t('activity.body')}
              </p>
              <div className="mt-8 border border-white/10 bg-black/14 px-4 py-4">
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#f4efe2]/44">
                  {t('activity.objectiveLabel')}
                </div>
                <p className="mt-3 text-sm leading-7 text-[#f4efe2]/72">
                  {t('activity.objectiveBody')}
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {activitySignals.map((activity, index) => (
                <AchievementCard
                  key={activity.title}
                  activity={activity}
                  index={index}
                  proofSourceLabel={t('activity.proofSource')}
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
                <SectionEyebrow>{t('trust.eyebrow')}</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {t('trust.title')}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/66">
                {t('trust.body')}
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

      <section
        id="demo-flow"
        className="scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="sds-panel rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <SectionEyebrow>{t('demo.eyebrow')}</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {t('demo.title')}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#f4efe2]/66">
                {t('demo.body')}
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {demoSteps.map((step) => (
                <DemoStepCard key={step.label} step={step} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <WarriorCallout />

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="sds-panel rounded-[2rem] px-5 py-7 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <SectionEyebrow>CTA</SectionEyebrow>
                <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2] sm:text-5xl">
                  {t('cta.title')}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#f4efe2]/72">
                  {t('cta.body')}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 lg:justify-end">
                <OfficialActionButton targetId="chronicle-command">
                  {t('cta.primary')}
                </OfficialActionButton>
                <OfficialActionButton targetId="warrior-card" typeClass="secondary">
                  {t('cta.secondary')}
                </OfficialActionButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
