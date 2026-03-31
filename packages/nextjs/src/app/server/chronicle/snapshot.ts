import type { MedalDefinition } from '~~/chronicle/config/medals'
import {
  buildStandardProgressLabel,
  buildStandardProof,
  buildVoidPioneerProgressLabel,
  buildVoidPioneerProof,
} from '~~/chronicle/config/businessCopy'
import { getMedalDefinitionByKind } from '~~/chronicle/config/medals'
import type {
  ChronicleClaimTicket,
  ChronicleMedalState,
  ChronicleMetrics,
} from '~~/chronicle/types'
import type { ActiveMedalTemplate } from '~~/server/chronicle/claimTickets'

// ─── Shared server-only snapshot logic ───────────────────────────────────────
// Used by both /api/chronicle/route.ts and /warrior/[walletAddress]/page.tsx

const clampPercent = (current: number, target: number) => {
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)))
}

const buildStandardMedal = (
  definition: MedalDefinition,
  current: number,
  target: number,
  claimed: boolean,
  proof: string | null,
  progressLabel: string,
  templateObjectId: string | null,
  claimTicket: ChronicleClaimTicket | null
): ChronicleMedalState => {
  const unlocked = current >= target

  return {
    kind: definition.kind,
    slug: definition.slug,
    title: definition.title,
    subtitle: definition.subtitle,
    rarity: definition.rarity,
    requirement: definition.requirement,
    teaser: definition.teaser,
    unlocked,
    claimed,
    claimable: unlocked && !claimed && claimTicket != null,
    progressCurrent: current,
    progressTarget: target,
    progressPercent: clampPercent(current, target),
    progressLabel,
    proof,
    templateObjectId,
    claimTicket,
  }
}

const buildVoidPioneerMedal = (
  claimed: boolean,
  networkNodeAnchors: number,
  storageUnitAnchors: number,
  templateObjectId: string | null,
  claimTicket: ChronicleClaimTicket | null,
  locale?: string
): ChronicleMedalState => {
  const definition = getMedalDefinitionByKind(2, locale)

  if (!definition) {
    throw new Error('Void Pioneer medal definition is missing')
  }

  const unlocked = networkNodeAnchors >= 1 || storageUnitAnchors >= 3
  const progressCurrent = unlocked
    ? networkNodeAnchors >= 1
      ? 1
      : 3
    : Math.min(storageUnitAnchors, 3)
  const progressTarget = unlocked && networkNodeAnchors >= 1 ? 1 : 3
  const proof =
    buildVoidPioneerProof({
      networkNodeAnchors,
      storageUnitAnchors,
      locale,
    })

  return {
    kind: definition.kind,
    slug: definition.slug,
    title: definition.title,
    subtitle: definition.subtitle,
    rarity: definition.rarity,
    requirement: definition.requirement,
    teaser: definition.teaser,
    unlocked,
    claimed,
    claimable: unlocked && !claimed && claimTicket != null,
    progressCurrent,
    progressTarget,
    progressPercent: unlocked
      ? 100
      : clampPercent(progressCurrent, progressTarget),
    progressLabel: buildVoidPioneerProgressLabel({
      networkNodeAnchors,
      storageUnitAnchors,
      locale,
    }),
    proof,
    templateObjectId,
    claimTicket,
  }
}

export const buildMedalStates = (
  counts: ChronicleMetrics,
  claimedSlugs: Set<string>,
  claimTicketsByKind: Partial<Record<number, ChronicleClaimTicket>>,
  activeTemplatesByKind: Map<number, ActiveMedalTemplate> = new Map(),
  locale?: string
): ChronicleMedalState[] => {
  const bloodlust = getMedalDefinitionByKind(1, locale)
  const courier = getMedalDefinitionByKind(3, locale)
  const turretSentry = getMedalDefinitionByKind(4, locale)
  const assemblyPioneer = getMedalDefinitionByKind(5, locale)
  const turretAnchor = getMedalDefinitionByKind(6, locale)
  const ssuTrader = getMedalDefinitionByKind(7, locale)
  const fuelFeeder = getMedalDefinitionByKind(8, locale)

  if (
    !bloodlust ||
    !courier ||
    !turretSentry ||
    !assemblyPioneer ||
    !turretAnchor ||
    !ssuTrader ||
    !fuelFeeder
  ) {
    throw new Error('Medal catalog is incomplete')
  }

  return [
    buildStandardMedal(
      bloodlust,
      counts.killmailAttacks,
      5,
      claimedSlugs.has(bloodlust.slug),
      counts.killmailAttacks >= 5
        ? buildStandardProof({
            slug: bloodlust.slug,
            current: counts.killmailAttacks,
            locale,
          })
        : null,
      buildStandardProgressLabel({
        slug: bloodlust.slug,
        current: counts.killmailAttacks,
        target: 5,
        locale,
      }),
      activeTemplatesByKind.get(bloodlust.kind)?.objectId ?? null,
      claimTicketsByKind[bloodlust.kind] || null
    ),
    buildVoidPioneerMedal(
      claimedSlugs.has('void-pioneer'),
      counts.networkNodeAnchors,
      counts.storageUnitAnchors,
      activeTemplatesByKind.get(2)?.objectId ?? null,
      claimTicketsByKind[2] || null,
      locale
    ),
    buildStandardMedal(
      courier,
      counts.gateJumps,
      10,
      claimedSlugs.has(courier.slug),
      counts.gateJumps >= 10
        ? buildStandardProof({
            slug: courier.slug,
            current: counts.gateJumps,
            locale,
          })
        : null,
      buildStandardProgressLabel({
        slug: courier.slug,
        current: counts.gateJumps,
        target: 10,
        locale,
      }),
      activeTemplatesByKind.get(courier.kind)?.objectId ?? null,
      claimTicketsByKind[courier.kind] || null
    ),
    buildStandardMedal(
      turretSentry,
      counts.turretOps,
      3,
      claimedSlugs.has(turretSentry.slug),
      counts.turretOps >= 3
        ? buildStandardProof({
            slug: turretSentry.slug,
            current: counts.turretOps,
            locale,
          })
        : null,
      buildStandardProgressLabel({
        slug: turretSentry.slug,
        current: counts.turretOps,
        target: 3,
        locale,
      }),
      activeTemplatesByKind.get(turretSentry.kind)?.objectId ?? null,
      claimTicketsByKind[turretSentry.kind] || null
    ),
    buildStandardMedal(
      assemblyPioneer,
      counts.assemblyOps,
      3,
      claimedSlugs.has(assemblyPioneer.slug),
      counts.assemblyOps >= 3
        ? buildStandardProof({
            slug: assemblyPioneer.slug,
            current: counts.assemblyOps,
            locale,
          })
        : null,
      buildStandardProgressLabel({
        slug: assemblyPioneer.slug,
        current: counts.assemblyOps,
        target: 3,
        locale,
      }),
      activeTemplatesByKind.get(assemblyPioneer.kind)?.objectId ?? null,
      claimTicketsByKind[assemblyPioneer.kind] || null
    ),
    buildStandardMedal(
      turretAnchor,
      counts.turretAnchors,
      3,
      claimedSlugs.has(turretAnchor.slug),
      counts.turretAnchors >= 3
        ? buildStandardProof({
            slug: turretAnchor.slug,
            current: counts.turretAnchors,
            locale,
          })
        : null,
      buildStandardProgressLabel({
        slug: turretAnchor.slug,
        current: counts.turretAnchors,
        target: 3,
        locale,
      }),
      activeTemplatesByKind.get(turretAnchor.kind)?.objectId ?? null,
      claimTicketsByKind[turretAnchor.kind] || null
    ),
    buildStandardMedal(
      ssuTrader,
      counts.ssuTradeOps,
      5,
      claimedSlugs.has(ssuTrader.slug),
      counts.ssuTradeOps >= 5
        ? buildStandardProof({
            slug: ssuTrader.slug,
            current: counts.ssuTradeOps,
            locale,
          })
        : null,
      buildStandardProgressLabel({
        slug: ssuTrader.slug,
        current: counts.ssuTradeOps,
        target: 5,
        locale,
      }),
      activeTemplatesByKind.get(ssuTrader.kind)?.objectId ?? null,
      claimTicketsByKind[ssuTrader.kind] || null
    ),
    buildStandardMedal(
      fuelFeeder,
      counts.networkNodeFuels,
      5,
      claimedSlugs.has(fuelFeeder.slug),
      counts.networkNodeFuels >= 5
        ? buildStandardProof({
            slug: fuelFeeder.slug,
            current: counts.networkNodeFuels,
            locale,
          })
        : null,
      buildStandardProgressLabel({
        slug: fuelFeeder.slug,
        current: counts.networkNodeFuels,
        target: 5,
        locale,
      }),
      activeTemplatesByKind.get(fuelFeeder.kind)?.objectId ?? null,
      claimTicketsByKind[fuelFeeder.kind] || null
    ),
  ]
}
