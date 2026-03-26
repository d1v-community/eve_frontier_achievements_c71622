import { SuiClient, type SuiObjectResponse, getFullnodeUrl } from '@mysten/sui/client'
import { isValidSuiAddress, isValidSuiObjectId } from '@mysten/sui/utils'
import {
  type MedalDefinition,
  getMedalDefinitionByKind,
} from '~~/chronicle/config/medals'
import type { ChronicleMedalState, ChronicleSnapshot } from '~~/chronicle/types'
import {
  CONTRACT_PACKAGE_ID_NOT_DEFINED,
  DEVNET_CONTRACT_PACKAGE_ID,
  LOCALNET_CONTRACT_PACKAGE_ID,
  MAINNET_CONTRACT_PACKAGE_ID,
  TESTNET_CONTRACT_PACKAGE_ID,
} from '~~/config/network'
import {
  fullStructName,
  getResponseContentField,
} from '~~/helpers/network'
import { fetchWalletActivitySnapshot } from '~~/server/chronicle/eveEyes'
import { ENetwork } from '~~/types/ENetwork'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPORTED_NETWORKS = new Set(Object.values(ENetwork))

const resolveContractPackageId = (network: ENetwork) => {
  switch (network) {
    case ENetwork.LOCALNET:
      return LOCALNET_CONTRACT_PACKAGE_ID
    case ENetwork.DEVNET:
      return DEVNET_CONTRACT_PACKAGE_ID
    case ENetwork.TESTNET:
      return TESTNET_CONTRACT_PACKAGE_ID
    case ENetwork.MAINNET:
      return MAINNET_CONTRACT_PACKAGE_ID
    default:
      return CONTRACT_PACKAGE_ID_NOT_DEFINED
  }
}

const isContractConfigured = (packageId: string) =>
  packageId !== CONTRACT_PACKAGE_ID_NOT_DEFINED && isValidSuiObjectId(packageId)

const getClaimedSlugs = (objects: SuiObjectResponse[]) => {
  const slugs = new Set<string>()

  objects.forEach((object) => {
    const slug = getResponseContentField(object, 'slug')

    if (typeof slug === 'string' && slug.length > 0) {
      slugs.add(slug)
    }
  })

  return slugs
}

const getRegistryObjectId = async (client: SuiClient, packageId: string) => {
  const events = await client.queryEvents({
    query: {
      MoveEventType: fullStructName(packageId, 'EventRegistryCreated'),
    },
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

const getOwnedMedals = async (
  client: SuiClient,
  owner: string,
  packageId: string
) => {
  const response = await client.getOwnedObjects({
    owner,
    filter: {
      StructType: fullStructName(packageId, 'Medal'),
    },
    options: {
      showContent: true,
      showDisplay: true,
    },
    limit: 50,
  })

  return response.data
}

const clampPercent = (current: number, target: number) => {
  if (target <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((current / target) * 100)))
}

const buildStandardMedal = (
  definition: MedalDefinition,
  current: number,
  target: number,
  claimed: boolean,
  proof: string | null,
  progressLabel: string,
  contractReady: boolean
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
    claimable: unlocked && !claimed && contractReady && proof != null,
    progressCurrent: current,
    progressTarget: target,
    progressPercent: clampPercent(current, target),
    progressLabel,
    proof,
  }
}

const buildVoidPioneerMedal = (
  claimed: boolean,
  networkNodeAnchors: number,
  storageUnitAnchors: number,
  contractReady: boolean
): ChronicleMedalState => {
  const definition = getMedalDefinitionByKind(2)

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
    networkNodeAnchors >= 1
      ? `Eve Eyes indexed ${networkNodeAnchors} successful network_node::anchor call(s).`
      : storageUnitAnchors >= 3
        ? `Eve Eyes indexed ${storageUnitAnchors} successful storage_unit::anchor call(s).`
        : null

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
    claimable: unlocked && !claimed && contractReady && proof != null,
    progressCurrent,
    progressTarget,
    progressPercent: unlocked
      ? 100
      : clampPercent(progressCurrent, progressTarget),
    progressLabel: `${networkNodeAnchors}/1 network node 或 ${storageUnitAnchors}/3 storage units`,
    proof,
  }
}

const buildMedalStates = (
  counts: ChronicleSnapshot['metrics'],
  claimedSlugs: Set<string>,
  contractReady: boolean
) => {
  const bloodlust = getMedalDefinitionByKind(1)
  const courier = getMedalDefinitionByKind(3)

  if (!bloodlust || !courier) {
    throw new Error('Medal catalog is incomplete')
  }

  return [
    buildStandardMedal(
      bloodlust,
      counts.killmailAttacks,
      5,
      claimedSlugs.has(bloodlust.slug),
      counts.killmailAttacks >= 5
        ? `Eve Eyes indexed ${counts.killmailAttacks} confirmed killmail attacker call(s).`
        : null,
      `${counts.killmailAttacks} / 5 indexed killmail attacker records`,
      contractReady
    ),
    buildVoidPioneerMedal(
      claimedSlugs.has('void-pioneer'),
      counts.networkNodeAnchors,
      counts.storageUnitAnchors,
      contractReady
    ),
    buildStandardMedal(
      courier,
      counts.gateJumps,
      10,
      claimedSlugs.has(courier.slug),
      counts.gateJumps >= 10
        ? `Eve Eyes indexed ${counts.gateJumps} successful gate::jump call(s).`
        : null,
      `${counts.gateJumps} / 10 verified gate jumps`,
      contractReady
    ),
  ]
}

const json = (payload: unknown, init?: ResponseInit) =>
  Response.json(payload, init)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const requestedNetwork = searchParams.get('network') || ENetwork.TESTNET

    if (!walletAddress || !isValidSuiAddress(walletAddress)) {
      return json(
        { error: 'walletAddress must be a valid Sui address' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_NETWORKS.has(requestedNetwork as ENetwork)) {
      return json(
        { error: `network must be one of: ${Object.values(ENetwork).join(', ')}` },
        { status: 400 }
      )
    }

    const network = requestedNetwork as ENetwork
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
      const client = new SuiClient({
        url: getFullnodeUrl(network),
      })

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

    const snapshot: ChronicleSnapshot = {
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
      medals: buildMedalStates(
        activitySnapshot.counts,
        claimedSlugs,
        contractReady
      ),
      warnings,
    }

    return json(snapshot)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to build chronicle snapshot'

    return json({ error: message }, { status: 500 })
  }
}
