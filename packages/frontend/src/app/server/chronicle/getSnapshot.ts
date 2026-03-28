import { computeWarriorScore } from '~~/chronicle/helpers/score'
import type { ChronicleClaimTicket, ChronicleSnapshot } from '~~/chronicle/types'
import {
  type ActiveMedalTemplate,
  buildClaimTickets,
  isClaimSigningConfigured,
} from '~~/server/chronicle/claimTickets'
import { buildChronicleWarnings } from '~~/server/chronicle/chronicleArchitecture'
import {
  isContractConfigured,
  loadChronicleContractState,
  resolveContractPackageId,
} from '~~/server/chronicle/contractState'
import { fetchWalletActivitySnapshot } from '~~/server/chronicle/eveEyes'
import { buildMedalStates } from '~~/server/chronicle/snapshot'
import { ENetwork } from '~~/types/ENetwork'

export const getChronicleSnapshot = async (
  walletAddress: string,
  network: ENetwork = ENetwork.TESTNET
): Promise<ChronicleSnapshot> => {
  const contractPackageId = resolveContractPackageId(network)
  const contractConfigured = isContractConfigured(contractPackageId)
  const activitySnapshot = await fetchWalletActivitySnapshot(walletAddress)
  let claimedSlugs = new Set<string>()
  let registryObjectId: string | null = null
  let activeTemplates = new Map<number, ActiveMedalTemplate>()
  const claimSigningConfigured = isClaimSigningConfigured()

  if (contractConfigured) {
    const contractState = await loadChronicleContractState(
      walletAddress,
      network,
      contractPackageId
    )
    claimedSlugs = contractState.claimedSlugs
    registryObjectId = contractState.registryObjectId
    activeTemplates = contractState.activeTemplates
  }

  const baseMedals = buildMedalStates(
    activitySnapshot.counts,
    claimedSlugs,
    {},
    activeTemplates
  )
  let claimTicketsByKind: Partial<Record<number, ChronicleClaimTicket>> = {}
  const warnings = buildChronicleWarnings(
    activitySnapshot.scanLimitReached
      ? activitySnapshot.scanMode === 'authenticated'
        ? 'Eve Eyes scan hit the configured page cap. Counts may be partial.'
        : 'Eve Eyes preview mode only scans the first few pages. Set EVE_EYES_API_KEY for deeper history.'
      : null,
    {
      contractConfigured,
      registryObjectId,
      claimSigningConfigured,
      activeTemplates,
    }
  )

  if (contractConfigured && registryObjectId && claimSigningConfigured) {
    try {
      claimTicketsByKind = await buildClaimTickets(
        walletAddress,
        network,
        registryObjectId,
        baseMedals,
        activeTemplates
      )
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Claim ticket generation failed: ${error.message}`
          : 'Claim ticket generation failed.'
      )
    }
  }

  const medals = buildMedalStates(
    activitySnapshot.counts,
    claimedSlugs,
    claimTicketsByKind,
    activeTemplates
  )

  return {
    profile: {
      walletAddress,
      requestedNetwork: network,
      observedNetwork: activitySnapshot.observedNetwork,
      evePackageId: activitySnapshot.evePackageId,
      characterId: activitySnapshot.characterId,
      lastActivityAt: activitySnapshot.lastActivityAt,
      scanMode: activitySnapshot.scanMode,
      scanLimitReached: activitySnapshot.scanLimitReached,
      scannedPages: activitySnapshot.scannedPages,
      contractConfigured,
      registryObjectId,
    },
    metrics: activitySnapshot.counts,
    medals,
    warnings,
    warriorScore: computeWarriorScore(medals),
  }
}
