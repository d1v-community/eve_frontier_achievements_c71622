import type { MedalKind, MedalSlug } from './config/medals'

export interface ChronicleProfile {
  walletAddress: string
  requestedNetwork: string
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
}

export interface ChronicleSnapshot {
  profile: ChronicleProfile
  metrics: ChronicleMetrics
  medals: ChronicleMedalState[]
  warnings: string[]
}
