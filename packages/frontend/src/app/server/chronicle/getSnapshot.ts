import { SuiClient, type SuiObjectResponse, getFullnodeUrl } from '@mysten/sui/client'
import { isValidSuiObjectId } from '@mysten/sui/utils'
import { computeWarriorScore } from '~~/chronicle/helpers/score'
import type { ChronicleSnapshot } from '~~/chronicle/types'
import {
  CONTRACT_PACKAGE_ID_NOT_DEFINED,
  DEVNET_CONTRACT_PACKAGE_ID,
  LOCALNET_CONTRACT_PACKAGE_ID,
  MAINNET_CONTRACT_PACKAGE_ID,
  TESTNET_CONTRACT_PACKAGE_ID,
} from '~~/config/network'
import { fullStructName, getResponseContentField } from '~~/helpers/network'
import { fetchWalletActivitySnapshot } from '~~/server/chronicle/eveEyes'
import { buildMedalStates } from '~~/server/chronicle/snapshot'
import { ENetwork } from '~~/types/ENetwork'

export const resolveContractPackageId = (network: ENetwork) => {
  switch (network) {
    case ENetwork.LOCALNET: return LOCALNET_CONTRACT_PACKAGE_ID
    case ENetwork.DEVNET: return DEVNET_CONTRACT_PACKAGE_ID
    case ENetwork.TESTNET: return TESTNET_CONTRACT_PACKAGE_ID
    case ENetwork.MAINNET: return MAINNET_CONTRACT_PACKAGE_ID
    default: return CONTRACT_PACKAGE_ID_NOT_DEFINED
  }
}

export const isContractConfigured = (packageId: string) =>
  packageId !== CONTRACT_PACKAGE_ID_NOT_DEFINED && isValidSuiObjectId(packageId)

const getClaimedSlugs = (objects: SuiObjectResponse[]) => {
  const slugs = new Set<string>()
  objects.forEach((object) => {
    const slug = getResponseContentField(object, 'slug')
    if (typeof slug === 'string' && slug.length > 0) slugs.add(slug)
  })
  return slugs
}

const getRegistryObjectId = async (client: SuiClient, packageId: string) => {
  const events = await client.queryEvents({
    query: { MoveEventType: fullStructName(packageId, 'EventRegistryCreated') },
    limit: 1,
    order: 'descending',
  })
  const parsedJson = events.data[0]?.parsedJson
  if (
    parsedJson &&
    typeof parsedJson === 'object' &&
    'registry_id' in parsedJson &&
    typeof parsedJson.registry_id === 'string'
  ) {
    return parsedJson.registry_id
  }
  return null
}

const getOwnedMedals = async (client: SuiClient, owner: string, packageId: string) => {
  const response = await client.getOwnedObjects({
    owner,
    filter: { StructType: fullStructName(packageId, 'Medal') },
    options: { showContent: true, showDisplay: true },
    limit: 50,
  })
  return response.data
}

export const getChronicleSnapshot = async (
  walletAddress: string,
  network: ENetwork = ENetwork.TESTNET
): Promise<ChronicleSnapshot> => {
  const contractPackageId = resolveContractPackageId(network)
  const contractConfigured = isContractConfigured(contractPackageId)
  const warnings: string[] = []

  const activitySnapshot = await fetchWalletActivitySnapshot(walletAddress)

  if (activitySnapshot.scanLimitReached) {
    warnings.push(
      activitySnapshot.scanMode === 'authenticated'
        ? 'Eve Eyes scan hit the configured page cap. Counts may be partial.'
        : 'Eve Eyes preview mode only scans the first few pages. Set EVE_EYES_API_KEY for deeper history.'
    )
  }

  let claimedSlugs = new Set<string>()
  let registryObjectId: string | null = null

  if (contractConfigured) {
    const client = new SuiClient({ url: getFullnodeUrl(network) })
    const [ownedMedals, registryId] = await Promise.all([
      getOwnedMedals(client, walletAddress, contractPackageId),
      getRegistryObjectId(client, contractPackageId),
    ])
    claimedSlugs = getClaimedSlugs(ownedMedals)
    registryObjectId = registryId

    if (!registryObjectId) {
      warnings.push(
        'The medals package is configured, but the shared registry event could not be located yet.'
      )
    }
  } else {
    warnings.push(
      'No medals contract package is configured for the current wallet network. Progress can be scanned, but claiming is disabled.'
    )
  }

  const contractReady = contractConfigured && registryObjectId != null
  const medals = buildMedalStates(activitySnapshot.counts, claimedSlugs, contractReady)

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
