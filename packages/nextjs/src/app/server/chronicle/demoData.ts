import { getMedalDefinitionByKind } from '~~/chronicle/config/medals'
import {
  buildDemoProof,
  buildStandardProgressLabel,
  buildVoidPioneerProgressLabel,
  getDemoModeWarning,
} from '~~/chronicle/config/businessCopy'
import { computeWarriorScore } from '~~/chronicle/helpers/score'
import type { ChronicleMedalState, ChronicleSnapshot } from '~~/chronicle/types'
import { ENetwork } from '~~/types/ENetwork'

const DEMO_METRICS = {
  killmailAttacks: 7,
  networkNodeAnchors: 1,
  storageUnitAnchors: 1,
  gateJumps: 15,
  turretOps: 0,
  assemblyOps: 0,
  turretAnchors: 0,
  ssuTradeOps: 0,
  networkNodeFuels: 0,
} as const

const clampPercent = (current: number, target: number) => {
  if (target <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((current / target) * 100)))
}

const buildDemoMedal = ({
  kind,
  unlocked,
  claimed,
  claimable,
  progressCurrent,
  progressTarget,
  proof,
  locale,
  voidPioneerCounts,
}: {
  kind: 1 | 2 | 3
  unlocked: boolean
  claimed: boolean
  claimable: boolean
  progressCurrent: number
  progressTarget: number
  proof: string
  locale?: string
  voidPioneerCounts?: {
    networkNodeAnchors: number
    storageUnitAnchors: number
  }
}): ChronicleMedalState => {
  const definition = getMedalDefinitionByKind(kind, locale)

  if (!definition) {
    throw new Error(`Missing medal definition for demo kind ${kind}`)
  }

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
    claimable,
    progressCurrent,
    progressTarget,
    progressPercent: clampPercent(progressCurrent, progressTarget),
    progressLabel:
      definition.slug === 'void-pioneer'
        ? buildVoidPioneerProgressLabel({
            networkNodeAnchors: voidPioneerCounts?.networkNodeAnchors ?? 0,
            storageUnitAnchors: voidPioneerCounts?.storageUnitAnchors ?? 0,
            locale,
          })
        : buildStandardProgressLabel({
            slug: definition.slug,
            current: progressCurrent,
            target: progressTarget,
            locale,
          }),
    proof,
    templateObjectId: null,
    claimTicket: null,
  }
}

export function generateDemoSnapshot(
  walletAddress: string,
  network: ENetwork,
  locale?: string
): ChronicleSnapshot {
  const medals = [
    buildDemoMedal({
      kind: 3,
      unlocked: true,
      claimed: true,
      claimable: false,
      progressCurrent: 15,
      progressTarget: 10,
      proof: buildDemoProof({ kind: 3, locale }) || '',
      locale,
    }),
    buildDemoMedal({
      kind: 1,
      unlocked: true,
      claimed: false,
      claimable: true,
      progressCurrent: 7,
      progressTarget: 5,
      proof: buildDemoProof({ kind: 1, locale }) || '',
      locale,
    }),
    buildDemoMedal({
      kind: 2,
      unlocked: true,
      claimed: false,
      claimable: true,
      progressCurrent: 2,
      progressTarget: 1,
      proof: buildDemoProof({ kind: 2, locale }) || '',
      locale,
      voidPioneerCounts: {
        networkNodeAnchors: DEMO_METRICS.networkNodeAnchors,
        storageUnitAnchors: DEMO_METRICS.storageUnitAnchors,
      },
    }),
  ]

  return {
    profile: {
      walletAddress,
      requestedNetwork: network,
      observedNetwork: network,
      evePackageId: 'demo-eve-package',
      characterId: 'DEMO-CHAR-12345',
      lastActivityAt: new Date('2026-03-31T00:12:00.000Z').toISOString(),
      scanMode: 'preview',
      scanLimitReached: false,
      scannedPages: 1,
      contractConfigured: false,
      registryObjectId: null,
    },
    metrics: DEMO_METRICS,
    medals,
    warnings: [getDemoModeWarning(locale)],
    warriorScore: computeWarriorScore(medals),
  }
}
