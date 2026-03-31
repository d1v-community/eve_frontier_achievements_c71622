#!/usr/bin/env node

const { promises: fs } = require('node:fs')
const { homedir } = require('node:os')
const path = require('node:path')

const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client')
const { Transaction } = require('@mysten/sui/transactions')
const { SIGNATURE_FLAG_TO_SCHEME } = require('@mysten/sui/cryptography')
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519')
const { Secp256k1Keypair } = require('@mysten/sui/keypairs/secp256k1')
const { Secp256r1Keypair } = require('@mysten/sui/keypairs/secp256r1')

const NETWORK = 'testnet'
const MODULE_NAME = 'medals'
const CLAIM_SIGNER_ENV_NAME = 'CHRONICLE_CLAIM_SIGNER_PRIVATE_KEY'
const CONTRACT_ROOT = path.resolve(__dirname, '..')
const PUBLISHED_TOML_PATH = path.join(CONTRACT_ROOT, 'move/medals/Published.toml')
const NEXTJS_ENV_PATH = path.resolve(CONTRACT_ROOT, '../nextjs/.env.local')
const SUI_CLIENT_CONFIG_PATH = path.join(
  homedir(),
  '.sui/sui_config/client.yaml'
)

const decodeHex = (value) => {
  const normalized = value.startsWith('0x') ? value.slice(2) : value

  if (normalized.length === 0 || normalized.length % 2 !== 0) {
    return null
  }

  if (!/^[0-9a-fA-F]+$/.test(normalized)) {
    return null
  }

  return Uint8Array.from(Buffer.from(normalized, 'hex'))
}

const decodeBase64 = (value) => {
  try {
    const bytes = Buffer.from(value, 'base64')

    if (bytes.length === 0) {
      return null
    }

    return Uint8Array.from(bytes)
  } catch {
    return null
  }
}

const getConfigValue = (content, pattern, label) => {
  const match = content.match(pattern)

  if (!match?.[1]) {
    throw new Error(`Unable to find ${label} in ${SUI_CLIENT_CONFIG_PATH}`)
  }

  return match[1].trim()
}

const getMoveField = (object, field) => {
  const content = object?.data?.content

  if (!content || content.dataType !== 'moveObject' || content.fields == null) {
    return null
  }

  return content.fields[field]
}

const queryAllEvents = async (client, moveEventType) => {
  const events = []
  let cursor = null

  while (true) {
    const page = await client.queryEvents({
      query: { MoveEventType: moveEventType },
      cursor,
      limit: 100,
      order: 'descending',
    })

    events.push(...page.data)

    if (!page.hasNextPage || page.nextCursor == null) {
      return events
    }

    cursor = page.nextCursor
  }
}

const toPublicKeyBase64 = (bytes) => Buffer.from(bytes).toString('base64')

const createKeypairFromKeystoreEntry = (encodedEntry) => {
  const bytes = Buffer.from(encodedEntry, 'base64')
  const scheme = SIGNATURE_FLAG_TO_SCHEME[bytes[0]]
  const secretKey = Uint8Array.from(bytes.subarray(1))

  switch (scheme) {
    case 'ED25519':
      return Ed25519Keypair.fromSecretKey(secretKey)
    case 'Secp256k1':
      return Secp256k1Keypair.fromSecretKey(secretKey)
    case 'Secp256r1':
      return Secp256r1Keypair.fromSecretKey(secretKey)
    default:
      throw new Error(`Unsupported key scheme flag in sui.keystore: ${bytes[0]}`)
  }
}

const parseClaimSignerKeypair = (rawValue) => {
  if (!rawValue) {
    throw new Error(
      `${CLAIM_SIGNER_ENV_NAME} is required to derive the claim signer public key`
    )
  }

  if (rawValue.startsWith('suiprivkey1')) {
    return Ed25519Keypair.fromSecretKey(rawValue)
  }

  const trimmed = rawValue.trim()
  const decoded = decodeHex(trimmed) || decodeBase64(trimmed)

  if (!decoded || decoded.length !== 32) {
    throw new Error(
      `${CLAIM_SIGNER_ENV_NAME} must be a suiprivkey string, 32-byte hex, or 32-byte base64 secret`
    )
  }

  return Ed25519Keypair.fromSecretKey(decoded)
}

const fullTypeName = (packageId, typeName) => `${packageId}::${MODULE_NAME}::${typeName}`

const readLocalEnvFile = async () => {
  try {
    const content = await fs.readFile(NEXTJS_ENV_PATH, 'utf8')

    return content.split('\n').reduce((envValues, line) => {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) {
        return envValues
      }

      const separatorIndex = trimmed.indexOf('=')

      if (separatorIndex === -1) {
        return envValues
      }

      const name = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim()

      envValues[name] = value
      return envValues
    }, {})
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return {}
    }

    throw error
  }
}

const readPublishedPackageId = async () => {
  const content = await fs.readFile(PUBLISHED_TOML_PATH, 'utf8')
  const match = content.match(
    /\[published\.testnet\][\s\S]*?published-at = "([^"]+)"/
  )

  if (!match?.[1]) {
    throw new Error(`Unable to find testnet package id in ${PUBLISHED_TOML_PATH}`)
  }

  return match[1]
}

const readSuiClientConfig = async () => {
  const content = await fs.readFile(SUI_CLIENT_CONFIG_PATH, 'utf8')

  return {
    activeAddress: getConfigValue(
      content,
      /^active_address:\s*"([^"]+)"$/m,
      'active_address'
    ),
    activeEnv: getConfigValue(content, /^active_env:\s*([^\n]+)$/m, 'active_env'),
    keystorePath: getConfigValue(content, /^\s*File:\s+([^\n]+)$/m, 'keystore path'),
  }
}

const loadActiveAddressKeypair = async () => {
  const clientConfig = await readSuiClientConfig()
  const keystoreContent = await fs.readFile(clientConfig.keystorePath, 'utf8')
  const entries = JSON.parse(keystoreContent)

  for (const entry of entries) {
    const keypair = createKeypairFromKeystoreEntry(entry)

    if (keypair.toSuiAddress() === clientConfig.activeAddress) {
      return {
        ...clientConfig,
        keypair,
      }
    }
  }

  throw new Error(
    `Unable to locate the active address ${clientConfig.activeAddress} in ${clientConfig.keystorePath}`
  )
}

const loadConfiguredClaimSignerFromEnv = async () => {
  const localEnv = await readLocalEnvFile()
  const signerSecret =
    process.env[CLAIM_SIGNER_ENV_NAME] ?? localEnv[CLAIM_SIGNER_ENV_NAME]
  const keypair = parseClaimSignerKeypair(signerSecret)
  const publicKeyBytes = keypair.getPublicKey().toRawBytes()

  return {
    keypair,
    publicKeyBytes,
    publicKeyBase64: toPublicKeyBase64(publicKeyBytes),
  }
}

const createTestnetClient = () => new SuiClient({ url: getFullnodeUrl(NETWORK) })

const queryLatestRegistryObjectId = async (client, packageId) => {
  const events = await client.queryEvents({
    query: { MoveEventType: fullTypeName(packageId, 'EventRegistryCreated') },
    limit: 1,
    order: 'descending',
  })
  const registryId = events.data[0]?.parsedJson?.registry_id

  return typeof registryId === 'string' ? registryId : null
}

const queryOwnedAdminCaps = async (client, owner, packageId) => {
  const response = await client.getOwnedObjects({
    owner,
    filter: { StructType: fullTypeName(packageId, 'AdminCap') },
    options: { showType: true },
    limit: 10,
  })

  return response.data
    .map((object) => object.data?.objectId ?? null)
    .filter(Boolean)
}

const queryActiveSignerPublicKeys = async (client, packageId) => {
  const events = await queryAllEvents(client, fullTypeName(packageId, 'EventSignerRotated'))
  const signerStates = new Map()

  events.forEach((event) => {
    const parsedJson = event.parsedJson

    if (
      !parsedJson ||
      typeof parsedJson !== 'object' ||
      !Array.isArray(parsedJson.public_key) ||
      typeof parsedJson.enabled !== 'boolean'
    ) {
      return
    }

    const publicKey = parsedJson.public_key

    if (
      !publicKey.every(
        (entry) =>
          typeof entry === 'number' &&
          Number.isInteger(entry) &&
          entry >= 0 &&
          entry <= 255
      )
    ) {
      return
    }

    const encoded = toPublicKeyBase64(Uint8Array.from(publicKey))

    if (!signerStates.has(encoded)) {
      signerStates.set(encoded, parsedJson.enabled)
    }
  })

  return new Set(
    [...signerStates.entries()]
      .filter(([, enabled]) => enabled)
      .map(([publicKey]) => publicKey)
  )
}

const queryActiveTemplateCount = async (client, packageId) => {
  const events = await queryAllEvents(
    client,
    fullTypeName(packageId, 'EventMedalTemplateAdded')
  )
  const templateIds = [
    ...new Set(
      events
        .map((event) => event.parsedJson?.template_id)
        .filter((value) => typeof value === 'string')
    ),
  ]

  if (templateIds.length === 0) {
    return 0
  }

  const objects = await client.multiGetObjects({
    ids: templateIds,
    options: { showContent: true },
  })

  return objects.filter((object) => getMoveField(object, 'active') === true).length
}

const buildProbeSnapshot = async () => {
  const client = createTestnetClient()
  const [{ activeAddress, activeEnv }, packageId] = await Promise.all([
    readSuiClientConfig(),
    readPublishedPackageId(),
  ])

  const [registryObjectId, adminCapIds, registeredSignerPublicKeys, activeTemplateCount] =
    await Promise.all([
      queryLatestRegistryObjectId(client, packageId),
      queryOwnedAdminCaps(client, activeAddress, packageId),
      queryActiveSignerPublicKeys(client, packageId),
      queryActiveTemplateCount(client, packageId),
    ])

  const claimSignerValue = process.env[CLAIM_SIGNER_ENV_NAME]
  const localEnv = await readLocalEnvFile()
  const configuredClaimSigner = claimSignerValue || localEnv[CLAIM_SIGNER_ENV_NAME]
    ? await loadConfiguredClaimSignerFromEnv()
    : null

  return {
    network: NETWORK,
    activeEnv,
    activeAddress,
    packageId,
    registryObjectId,
    activeTemplateCount,
    activeSignerCount: registeredSignerPublicKeys.size,
    adminCapCount: adminCapIds.length,
    adminCapIds,
    claimSignerConfigured: configuredClaimSigner != null,
    claimSignerPublicKeyBase64: configuredClaimSigner?.publicKeyBase64 ?? null,
    claimSignerRegistered:
      configuredClaimSigner != null &&
      registeredSignerPublicKeys.has(configuredClaimSigner.publicKeyBase64),
  }
}

const registerClaimSigner = async () => {
  const client = createTestnetClient()
  const [packageId, activeSigner, configuredSigner] = await Promise.all([
    readPublishedPackageId(),
    loadActiveAddressKeypair(),
    loadConfiguredClaimSignerFromEnv(),
  ])

  if (activeSigner.activeEnv !== NETWORK) {
    throw new Error(
      `Active Sui environment is ${activeSigner.activeEnv}, but ${NETWORK} is required for signer registration`
    )
  }

  const [registryObjectId, adminCapIds, registeredSignerPublicKeys] = await Promise.all([
    queryLatestRegistryObjectId(client, packageId),
    queryOwnedAdminCaps(client, activeSigner.activeAddress, packageId),
    queryActiveSignerPublicKeys(client, packageId),
  ])

  if (!registryObjectId) {
    throw new Error(`No shared MedalRegistry event was found for package ${packageId}`)
  }

  if (adminCapIds.length === 0) {
    throw new Error(
      `Address ${activeSigner.activeAddress} does not own an AdminCap for package ${packageId}`
    )
  }

  if (adminCapIds.length > 1) {
    throw new Error(
      `Address ${activeSigner.activeAddress} owns multiple AdminCap objects: ${adminCapIds.join(', ')}`
    )
  }

  if (registeredSignerPublicKeys.has(configuredSigner.publicKeyBase64)) {
    return {
      network: NETWORK,
      packageId,
      registryObjectId,
      adminCapId: adminCapIds[0],
      activeAddress: activeSigner.activeAddress,
      claimSignerPublicKeyBase64: configuredSigner.publicKeyBase64,
      alreadyRegistered: true,
      claimSignerRegistered: true,
      activeSignerCount: registeredSignerPublicKeys.size,
    }
  }

  const tx = new Transaction()
  tx.setSender(activeSigner.activeAddress)
  tx.moveCall({
    target: `${packageId}::${MODULE_NAME}::add_signer`,
    arguments: [
      tx.object(adminCapIds[0]),
      tx.object(registryObjectId),
      tx.pure.vector('u8', Array.from(configuredSigner.publicKeyBytes)),
    ],
  })

  const response = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: activeSigner.keypair,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
    requestType: 'WaitForLocalExecution',
  })

  const refreshedSignerPublicKeys = await queryActiveSignerPublicKeys(client, packageId)

  return {
    network: NETWORK,
    packageId,
    registryObjectId,
    adminCapId: adminCapIds[0],
    activeAddress: activeSigner.activeAddress,
    claimSignerPublicKeyBase64: configuredSigner.publicKeyBase64,
    alreadyRegistered: false,
    digest: response.digest,
    status: response.effects?.status?.status ?? null,
    claimSignerRegistered: refreshedSignerPublicKeys.has(
      configuredSigner.publicKeyBase64
    ),
    activeSignerCount: refreshedSignerPublicKeys.size,
  }
}

module.exports = {
  CLAIM_SIGNER_ENV_NAME,
  NETWORK,
  buildProbeSnapshot,
  NEXTJS_ENV_PATH,
  registerClaimSigner,
}
