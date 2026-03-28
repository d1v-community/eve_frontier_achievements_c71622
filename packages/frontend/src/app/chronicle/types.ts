import type { MedalKind, MedalSlug } from './config/medals'
import type { ENetwork } from '~~/types/ENetwork'

export interface ChronicleProfile {
  walletAddress: string
  requestedNetwork: ENetwork
  observedNetwork: string | null
  evePackageId: string | null
  characterId: string | null
  lastActivityAt: string | null
  scanMode: 'preview' | 'authenticated'
  scanLimitReached: boolean
  scannedPages: number
  contractConfigured: boolean
  registryObjectId: string | null
}

export interface ChronicleMetrics {
  killmailAttacks: number
  networkNodeAnchors: number
  storageUnitAnchors: number
  gateJumps: number
  turretOps: number
  assemblyOps: number
  turretAnchors: number
  ssuTradeOps: number
  networkNodeFuels: number
}

export interface ChronicleMedalState {
  kind: MedalKind
  slug: MedalSlug
  title: string
  subtitle: string
  rarity: string
  requirement: string
  teaser: string
  unlocked: boolean
  claimed: boolean
  claimable: boolean
  progressCurrent: number
  progressTarget: number
  progressPercent: number
  progressLabel: string
  proof: string | null
  templateObjectId: string | null
  claimTicket: ChronicleClaimTicket | null
}

export interface ChronicleClaimTicket {
  templateObjectId: string
  templateVersion: number
  proofDigestBase64: string
  evidenceUri: string
  issuedAtMs: string
  deadlineMs: string
  nonceBase64: string
  signerPublicKeyBase64: string
  signatureBase64: string
}

export interface ChronicleSnapshot {
  profile: ChronicleProfile
  metrics: ChronicleMetrics
  medals: ChronicleMedalState[]
  warnings: string[]
  warriorScore: WarriorScore
}

// ─── Combat Rank & Warrior Score ─────────────────────────────────────────────

export type RankTone = 'steel' | 'amber' | 'azure' | 'martian' | 'crimson'

export interface CombatRank {
  tier: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  title: string
  titleZh: string
  minScore: number
  maxScore: number
  tone: RankTone
  description: string
}

export interface ScoreBreakdownEntry {
  medal: MedalSlug
  basePoints: number
  multiplier: number
  contribution: number
}

export interface WarriorScore {
  displayScore: number
  rank: CombatRank
  claimedMedalCount: number
  unlockedMedalCount: number
  hasFullSet: boolean
  breakdown: ScoreBreakdownEntry[]
}
