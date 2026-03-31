/**
 * Mock snapshot builder for demo / mock mode (?m=1).
 *
 * Builds a fully-typed ChronicleSnapshot without hitting any API or chain.
 * `localClaimedSlugs` is maintained by the dashboard to simulate sequential claims.
 */
import type { ENetwork } from '~~/types/ENetwork'
import {
  buildStandardProgressLabel,
  buildVoidPioneerProgressLabel,
  getMockModeWarning,
  resolveChronicleBusinessLocale,
} from '~~/chronicle/config/businessCopy'
import { getLocalizedMedalCatalog, resolveMedalLocale } from '../config/medals'
import { computeWarriorScore } from '../helpers/score'
import {
  createMockClaimTicket,
  createMockMedalProof,
  createMockProfileArtifacts,
  createMockTemplateObjectId,
} from './mockArtifacts'
import type { ChronicleMedalState, ChronicleSnapshot } from '../types'

// ─── Per-medal progress in mock mode ─────────────────────────────────────────
const MOCK_PROGRESS: Record<
  string,
  { current: number; target: number }
> = {
  'bloodlust-butcher': {
    current: 7,
    target: 5,
  },
  'void-pioneer': {
    current: 1,
    target: 1,
  },
  'galactic-courier': {
    current: 14,
    target: 10,
  },
  'turret-sentry': {
    current: 4,
    target: 3,
  },
  'assembly-pioneer': {
    current: 1,
    target: 3,
  },
  'turret-anchor': {
    current: 1,
    target: 3,
  },
  'ssu-trader': {
    current: 2,
    target: 5,
  },
  'fuel-feeder': {
    current: 1,
    target: 5,
  },
}

// Medals that start as "already claimed" in every mock session.
const BASE_CLAIMED = new Set(['bloodlust-butcher'])

// Medals that start as "claimable" (unlocked but not yet bound) in mock mode.
const BASE_CLAIMABLE = new Set(['void-pioneer', 'turret-sentry'])

// Medals that are unlocked and can be demo-minted directly without a claim ticket.
const BASE_MINTABLE = new Set(['galactic-courier'])

// ─── Main builder ─────────────────────────────────────────────────────────────

/**
 * @param walletAddress  Connected wallet – shown in the pilot manifest panel.
 * @param network        Active network – shown in the status pill.
 * @param localClaimedSlugs  Set of slugs the user has "claimed" locally this
 *                           session (starts empty, grows as they click Claim).
 */
export function buildMockSnapshot(
  walletAddress: string,
  network: ENetwork,
  localClaimedSlugs: Set<string>,
  locale?: string
): ChronicleSnapshot {
  const resolvedLocale = resolveMedalLocale(locale)
  const businessLocale = resolveChronicleBusinessLocale(locale)
  const medalCatalog = getLocalizedMedalCatalog(resolvedLocale)
  const profileArtifacts = createMockProfileArtifacts({
    walletAddress,
    network,
  })
  const issuedAtBase = Date.now() - 2 * 60 * 1000
  const medals: ChronicleMedalState[] = medalCatalog.map((def) => {
    const isClaimed =
      BASE_CLAIMED.has(def.slug) || localClaimedSlugs.has(def.slug)
    const isMintable = BASE_MINTABLE.has(def.slug) && !isClaimed
    const isClaimable = BASE_CLAIMABLE.has(def.slug) && !isClaimed
    const isUnlocked = isClaimed || isClaimable || isMintable
    const progress = MOCK_PROGRESS[def.slug]
    const title =
      def.slug === 'galactic-courier' && resolvedLocale === 'zh-CN'
        ? '星门拓荒者'
        : def.title
    const teaser =
      def.slug === 'galactic-courier' && resolvedLocale === 'zh-CN'
        ? '你穿过的每一道星门，都会在演示里变成一枚可以当场铸造、当场炫耀的勋章。'
        : def.slug === 'galactic-courier'
          ? 'Every gate you cross in the demo becomes a medal you can mint and show on the spot.'
          : def.teaser
    const templateObjectId = isUnlocked
      ? createMockTemplateObjectId({
          walletAddress,
          network,
          slug: def.slug,
        })
      : null
    const claimTicket =
      isClaimable && templateObjectId
        ? createMockClaimTicket({
            walletAddress,
            network,
            definition: def,
            templateObjectId,
            issuedAtMs: issuedAtBase + def.kind * 7_500,
          })
        : null

    return {
      kind: def.kind,
      slug: def.slug,
      title,
      subtitle: def.subtitle,
      rarity: def.rarity,
      requirement: def.requirement,
      teaser,
      unlocked: isUnlocked,
      claimed: isClaimed,
      claimable: isClaimable,
      progressCurrent: progress.current,
      progressTarget: progress.target,
      progressPercent: Math.min(
        100,
        Math.round((progress.current / progress.target) * 100)
      ),
      progressLabel:
        def.slug === 'void-pioneer'
          ? buildVoidPioneerProgressLabel({
              networkNodeAnchors: 1,
              storageUnitAnchors: 1,
              locale: businessLocale,
            })
          : buildStandardProgressLabel({
              slug: def.slug,
              current: progress.current,
              target: progress.target,
              locale: businessLocale,
            }),
      proof: isUnlocked
        ? createMockMedalProof({
            walletAddress,
            network,
            definition: def,
            current: progress.current,
            target: progress.target,
            claimed: isClaimed,
            locale: businessLocale,
          })
        : null,
      templateObjectId,
      claimTicket,
    }
  })

  const warriorScore = computeWarriorScore(medals)

  return {
    profile: {
      walletAddress,
      requestedNetwork: network,
      observedNetwork: `frontier-${network}`,
      evePackageId: profileArtifacts.evePackageId,
      characterId: profileArtifacts.characterId,
      lastActivityAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      scanMode: 'authenticated',
      scanLimitReached: false,
      scannedPages: 12,
      contractConfigured: true,
      registryObjectId: profileArtifacts.registryObjectId,
    },
    metrics: {
      killmailAttacks: 7,
      networkNodeAnchors: 1,
      storageUnitAnchors: 1,
      gateJumps: 14,
      turretOps: 4,
      assemblyOps: 1,
      turretAnchors: 1,
      ssuTradeOps: 2,
      networkNodeFuels: 1,
    },
    medals,
    warnings: [getMockModeWarning(businessLocale)],
    warriorScore,
  }
}
