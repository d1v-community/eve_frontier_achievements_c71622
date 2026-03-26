const EVE_EYES_BASE_URL = process.env.EVE_EYES_BASE_URL || 'https://eve-eyes.d0v.xyz'
const EVE_EYES_API_KEY = process.env.EVE_EYES_API_KEY
const MOVE_CALL_PAGE_SIZE = 100
const FREE_SCAN_PAGE_LIMIT = 3
const AUTHENTICATED_SCAN_PAGE_LIMIT = Math.max(
  FREE_SCAN_PAGE_LIMIT,
  Number(process.env.EVE_EYES_SCAN_PAGE_LIMIT || 12)
)

interface EveEyesActionEntity {
  value: string
  kind: string
  label: string
}

export interface EveEyesMoveCall {
  txDigest: string
  callIndex: number
  packageId: string | null
  moduleName: string
  functionName: string
  rawCall: string
  transactionTime: string | null
  createdAt: string | null
  network: string | null
  senderAddress: string | null
  status: string | null
  checkpoint: string | null
  actionSummary: string | null
  actionEntities: EveEyesActionEntity[]
}

interface EveEyesMoveCallPage {
  items: EveEyesMoveCall[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    freePageLimit: number
  }
  auth: {
    type: string
  }
}

interface EveEyesWindow {
  items: EveEyesMoveCall[]
  authType: string
  scanLimitReached: boolean
  scannedPages: number
}

export interface WalletActivitySnapshot {
  counts: {
    killmailAttacks: number
    networkNodeAnchors: number
    storageUnitAnchors: number
    gateJumps: number
  }
  characterId: string | null
  evePackageId: string | null
  observedNetwork: string | null
  lastActivityAt: string | null
  scanMode: 'preview' | 'authenticated'
  scanLimitReached: boolean
  scannedPages: number
}

const buildHeaders = () => {
  if (!EVE_EYES_API_KEY) {
    return undefined
  }

  return {
    Authorization: `ApiKey ${EVE_EYES_API_KEY}`,
  }
}

const fetchMoveCallPage = async (
  params: Record<string, string>,
  page: number
): Promise<EveEyesMoveCallPage> => {
  const searchParams = new URLSearchParams({
    ...params,
    includeActionSummary: '1',
    page: String(page),
    pageSize: String(MOVE_CALL_PAGE_SIZE),
  })

  const response = await fetch(
    `${EVE_EYES_BASE_URL}/api/indexer/move-calls?${searchParams.toString()}`,
    {
      cache: 'no-store',
      headers: buildHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error(`Eve Eyes move-calls request failed: ${response.status}`)
  }

  return response.json()
}

const collectMoveCalls = async (
  params: Record<string, string>
): Promise<EveEyesWindow> => {
  const maxPages = EVE_EYES_API_KEY
    ? AUTHENTICATED_SCAN_PAGE_LIMIT
    : FREE_SCAN_PAGE_LIMIT

  const items: EveEyesMoveCall[] = []
  let authType = 'anonymous'
  let totalPages = 1
  let scannedPages = 0

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchMoveCallPage(params, page)
    authType = payload.auth.type
    totalPages = payload.pagination.totalPages
    scannedPages = page
    items.push(...payload.items)

    if (page >= totalPages) {
      break
    }
  }

  return {
    items,
    authType,
    scanLimitReached: totalPages > scannedPages,
    scannedPages,
  }
}

const dedupeMoveCalls = (...collections: EveEyesMoveCall[][]) => {
  const deduped = new Map<string, EveEyesMoveCall>()

  collections.flat().forEach((item) => {
    deduped.set(`${item.txDigest}:${item.callIndex}`, item)
  })

  return [...deduped.values()]
}

const getLatestTimestamp = (items: EveEyesMoveCall[]) => {
  return items
    .map((item) => item.transactionTime || item.createdAt)
    .filter((value): value is string => typeof value === 'string')
    .sort((left, right) => right.localeCompare(left))[0] || null
}

const getCharacterId = (items: EveEyesMoveCall[]) => {
  for (const item of items) {
    const character = item.actionEntities.find((entity) => entity.label === 'character')

    if (character) {
      return character.value
    }
  }

  return null
}

const getFirstValue = (
  items: EveEyesMoveCall[],
  pick: (item: EveEyesMoveCall) => string | null
) => {
  for (const item of items) {
    const value = pick(item)

    if (value) {
      return value
    }
  }

  return null
}

export const fetchWalletActivitySnapshot = async (
  walletAddress: string
): Promise<WalletActivitySnapshot> => {
  const [
    killmailRegistryWindow,
    killmailWindow,
    networkNodeWindow,
    storageUnitWindow,
    gateJumpWindow,
  ] = await Promise.all([
    collectMoveCalls({
      senderAddress: walletAddress,
      moduleName: 'killmail_registry',
    }),
    collectMoveCalls({
      senderAddress: walletAddress,
      moduleName: 'killmail',
    }),
    collectMoveCalls({
      senderAddress: walletAddress,
      moduleName: 'network_node',
      functionName: 'anchor',
    }),
    collectMoveCalls({
      senderAddress: walletAddress,
      moduleName: 'storage_unit',
      functionName: 'anchor',
    }),
    collectMoveCalls({
      senderAddress: walletAddress,
      moduleName: 'gate',
      functionName: 'jump',
    }),
  ])

  const killmailCalls = dedupeMoveCalls(
    killmailRegistryWindow.items,
    killmailWindow.items
  )
  const activityCalls = dedupeMoveCalls(
    killmailCalls,
    networkNodeWindow.items,
    storageUnitWindow.items,
    gateJumpWindow.items
  )

  return {
    counts: {
      killmailAttacks: killmailCalls.length,
      networkNodeAnchors: networkNodeWindow.items.length,
      storageUnitAnchors: storageUnitWindow.items.length,
      gateJumps: gateJumpWindow.items.length,
    },
    characterId: getCharacterId(gateJumpWindow.items),
    evePackageId: getFirstValue(activityCalls, (item) => item.packageId),
    observedNetwork: getFirstValue(activityCalls, (item) => item.network),
    lastActivityAt: getLatestTimestamp(activityCalls),
    scanMode:
      [
        killmailRegistryWindow.authType,
        killmailWindow.authType,
        networkNodeWindow.authType,
        storageUnitWindow.authType,
        gateJumpWindow.authType,
      ].some((authType) => authType !== 'anonymous')
        ? 'authenticated'
        : 'preview',
    scanLimitReached:
      killmailRegistryWindow.scanLimitReached ||
      killmailWindow.scanLimitReached ||
      networkNodeWindow.scanLimitReached ||
      storageUnitWindow.scanLimitReached ||
      gateJumpWindow.scanLimitReached,
    scannedPages:
      killmailRegistryWindow.scannedPages +
      killmailWindow.scannedPages +
      networkNodeWindow.scannedPages +
      storageUnitWindow.scannedPages +
      gateJumpWindow.scannedPages,
  }
}
