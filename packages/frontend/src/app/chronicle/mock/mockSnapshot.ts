/**
 * Mock snapshot builder for demo / mock mode (?m=1).
 *
 * Builds a fully-typed ChronicleSnapshot without hitting any API or chain.
 * `localClaimedSlugs` is maintained by the dashboard to simulate sequential claims.
 */
import type { ENetwork } from '~~/types/ENetwork'
import { MEDAL_CATALOG } from '../config/medals'
import { computeWarriorScore } from '../helpers/score'
import type {
  ChronicleClaimTicket,
  ChronicleMedalState,
  ChronicleSnapshot,
} from '../types'

// ─── Static fake claim ticket ─────────────────────────────────────────────────
// Won't be submitted to chain – only used to satisfy the claimTicket guard in
// the dashboard so the Claim button renders properly.
const MOCK_CLAIM_TICKET: ChronicleClaimTicket = {
  templateObjectId: '0x' + '1'.repeat(63),
  templateVersion: 1,
  proofDigestBase64: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  evidenceUri: 'https://mock.frontier.chronicle/evidence/demo',
  issuedAtMs: String(Date.now()),
  deadlineMs: String(Date.now() + 24 * 60 * 60 * 1000),
  nonceBase64: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  signerPublicKeyBase64: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  signatureBase64: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
}

// ─── Per-medal progress in mock mode ─────────────────────────────────────────
const MOCK_PROGRESS: Record<
  string,
  { current: number; target: number; label: string }
> = {
  'bloodlust-butcher': {
    current: 7,
    target: 5,
    label: '7 / 5 confirmed attacker records',
  },
  'void-pioneer': {
    current: 1,
    target: 1,
    label: '1 / 1 network node anchored',
  },
  'galactic-courier': {
    current: 14,
    target: 10,
    label: '14 / 10 verified gate jumps',
  },
  'turret-sentry': {
    current: 4,
    target: 3,
    label: '4 / 3 turret operations',
  },
  'assembly-pioneer': {
    current: 1,
    target: 3,
    label: '1 / 3 smart assembly interactions',
  },
  'turret-anchor': {
    current: 1,
    target: 3,
    label: '1 / 3 turret anchors deployed',
  },
  'ssu-trader': {
    current: 2,
    target: 5,
    label: '2 / 5 SSU trade operations',
  },
  'fuel-feeder': {
    current: 1,
    target: 5,
    label: '1 / 5 network node fuels',
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
  localClaimedSlugs: Set<string>
): ChronicleSnapshot {
  const medals: ChronicleMedalState[] = MEDAL_CATALOG.map((def) => {
    const isClaimed =
      BASE_CLAIMED.has(def.slug) || localClaimedSlugs.has(def.slug)
    const isMintable = BASE_MINTABLE.has(def.slug) && !isClaimed
    const isClaimable = BASE_CLAIMABLE.has(def.slug) && !isClaimed
    const isUnlocked = isClaimed || isClaimable || isMintable
    const progress = MOCK_PROGRESS[def.slug]
    const title = def.slug === 'galactic-courier' ? '星门拓荒者' : def.title
    const teaser =
      def.slug === 'galactic-courier'
        ? '你穿过的每一道星门，都会在演示里变成一枚可以当场铸造、当场炫耀的勋章。'
        : def.teaser

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
      progressLabel: progress.label,
      proof: isClaimed ? `0x${'a'.repeat(62)}${def.kind.toString().padStart(2, '0')}` : null,
      templateObjectId: isUnlocked ? `0x${String(def.kind).repeat(64).slice(0, 64)}` : null,
      claimTicket: isClaimable ? MOCK_CLAIM_TICKET : null,
    }
  })

  const warriorScore = computeWarriorScore(medals)

  return {
    profile: {
      walletAddress,
      requestedNetwork: network,
      observedNetwork: 'frontier-testnet',
      evePackageId: '0x' + 'e'.repeat(63),
      characterId: '0x' + 'c'.repeat(63),
      lastActivityAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      scanMode: 'authenticated',
      scanLimitReached: false,
      scannedPages: 12,
      contractConfigured: true,
      registryObjectId: '0x' + 'b'.repeat(63),
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
    warnings: ['[MOCK MODE] 当前数据为模拟演示，不涉及任何真实链上交易。'],
    warriorScore,
  }
}
