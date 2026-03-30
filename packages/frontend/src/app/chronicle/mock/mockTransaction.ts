import type { MedalSlug } from '../config/medals'

export type MockMedalTxAction = 'mint' | 'claim'
export type MockMedalTxStageId =
  | 'prepare'
  | 'simulate'
  | 'sign'
  | 'submit'
  | 'finalize'

export interface MockMedalTxStage {
  id: MockMedalTxStageId
  durationMs: number
}

export type MockMedalTxEventId =
  | 'proofVerified'
  | 'transactionAssembled'
  | 'walletApproved'
  | 'medalBound'
  | 'claimTicketConsumed'

export interface MockMedalTxEvent {
  id: MockMedalTxEventId
  module: string
  type: string
}

export type MockMedalTxObjectChangeKind =
  | 'created'
  | 'mutated'
  | 'transferred'
  | 'deleted'

export type MockMedalTxObjectRole =
  | 'medal'
  | 'registry'
  | 'template'
  | 'claimTicket'

export interface MockMedalTxObjectChange {
  kind: MockMedalTxObjectChangeKind
  role: MockMedalTxObjectRole
  objectId: string
  objectType: string
  owner: string | null
}

export interface MockMedalTxReceipt {
  slug: MedalSlug
  action: MockMedalTxAction
  medalTitle: string
  stages: MockMedalTxStage[]
  currentStageIndex: number
  digest: string
  checkpoint: string
  packageId: string
  gasBudget: string
  gasUsed: string
  storageRebate: string
  objectId: string
  events: MockMedalTxEvent[]
  objectChanges: MockMedalTxObjectChange[]
  at: string
}

const sleep = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs))

const randomHex = (length: number) => {
  let output = ''

  while (output.length < length) {
    output += Math.floor(Math.random() * 16).toString(16)
  }

  return output.slice(0, length)
}

const buildStages = (action: MockMedalTxAction): MockMedalTxStage[] => {
  if (action === 'mint') {
    return [
      {
        id: 'prepare',
        durationMs: 520,
      },
      {
        id: 'simulate',
        durationMs: 760,
      },
      {
        id: 'sign',
        durationMs: 680,
      },
      {
        id: 'submit',
        durationMs: 860,
      },
      {
        id: 'finalize',
        durationMs: 620,
      },
    ]
  }

  return [
    {
      id: 'prepare',
      durationMs: 460,
    },
    {
      id: 'simulate',
      durationMs: 720,
    },
    {
      id: 'sign',
      durationMs: 640,
    },
    {
      id: 'submit',
      durationMs: 820,
    },
    {
      id: 'finalize',
      durationMs: 560,
    },
  ]
}

const buildMockEvents = (action: MockMedalTxAction): MockMedalTxEvent[] => {
  if (action === 'mint') {
    return [
      {
        id: 'transactionAssembled',
        module: 'medals::public_mint',
        type: 'MintTransactionPrepared',
      },
      {
        id: 'walletApproved',
        module: 'wallet::signer',
        type: 'UserApproved',
      },
      {
        id: 'medalBound',
        module: 'medals::events',
        type: 'MedalMinted',
      },
    ]
  }

  return [
    {
      id: 'proofVerified',
      module: 'chronicle::claims',
      type: 'ClaimProofVerified',
    },
    {
      id: 'transactionAssembled',
      module: 'medals::claim',
      type: 'ClaimTransactionPrepared',
    },
    {
      id: 'claimTicketConsumed',
      module: 'chronicle::claims',
      type: 'ClaimTicketConsumed',
    },
    {
      id: 'medalBound',
      module: 'medals::events',
      type: 'MedalClaimed',
    },
  ]
}

const buildObjectChanges = ({
  action,
  medalObjectId,
  registryObjectId,
  packageId,
  owner,
}: {
  action: MockMedalTxAction
  medalObjectId: string
  registryObjectId: string
  packageId: string
  owner: string
}): MockMedalTxObjectChange[] => {
  if (action === 'mint') {
    return [
      {
        kind: 'mutated',
        role: 'template',
        objectId: packageId,
        objectType: '0xeve_medals::medals::Template',
        owner: 'Shared',
      },
      {
        kind: 'created',
        role: 'medal',
        objectId: medalObjectId,
        objectType: '0xeve_medals::medals::SoulboundMedal',
        owner,
      },
      {
        kind: 'mutated',
        role: 'registry',
        objectId: registryObjectId,
        objectType: '0xeve_medals::medals::Registry',
        owner: 'Shared',
      },
      {
        kind: 'transferred',
        role: 'medal',
        objectId: medalObjectId,
        objectType: '0xeve_medals::medals::SoulboundMedal',
        owner,
      },
    ]
  }

  return [
    {
      kind: 'mutated',
      role: 'registry',
      objectId: registryObjectId,
      objectType: '0xeve_medals::medals::Registry',
      owner: 'Shared',
    },
    {
      kind: 'deleted',
      role: 'claimTicket',
      objectId: `0x${randomHex(64)}`,
      objectType: '0xeve_medals::claims::ClaimTicket',
      owner: null,
    },
    {
      kind: 'created',
      role: 'medal',
      objectId: medalObjectId,
      objectType: '0xeve_medals::medals::SoulboundMedal',
      owner,
    },
    {
      kind: 'transferred',
      role: 'medal',
      objectId: medalObjectId,
      objectType: '0xeve_medals::medals::SoulboundMedal',
      owner,
    },
  ]
}

export const createMockMedalReceipt = ({
  slug,
  action,
  medalTitle,
  walletAddress,
}: {
  slug: MedalSlug
  action: MockMedalTxAction
  medalTitle: string
  walletAddress?: string
}): MockMedalTxReceipt => {
  const stages = buildStages(action)
  const digest = `0x${randomHex(64)}`
  const checkpoint = `${100000 + Math.floor(Math.random() * 900000)}`
  const objectId = `0x${randomHex(64)}`
  const packageId = `0x${randomHex(64)}`
  const registryObjectId = `0x${randomHex(64)}`
  const owner = walletAddress ?? `0x${randomHex(64)}`

  return {
    slug,
    action,
    medalTitle,
    stages,
    currentStageIndex: 0,
    digest,
    checkpoint,
    packageId,
    gasBudget: `${120000000 + Math.floor(Math.random() * 60000000)} MIST`,
    gasUsed: `${80000000 + Math.floor(Math.random() * 25000000)} MIST`,
    storageRebate: `${4000000 + Math.floor(Math.random() * 3000000)} MIST`,
    objectId,
    events: buildMockEvents(action),
    objectChanges: buildObjectChanges({
      action,
      medalObjectId: objectId,
      registryObjectId,
      packageId,
      owner,
    }),
    at: new Date().toISOString(),
  }
}

export const runMockMedalTransaction = async ({
  slug,
  action,
  medalTitle,
  receipt: existingReceipt,
  onUpdate,
}: {
  slug: MedalSlug
  action: MockMedalTxAction
  medalTitle: string
  receipt?: MockMedalTxReceipt
  onUpdate?: (receipt: MockMedalTxReceipt) => void
}) => {
  const receipt =
    existingReceipt ?? createMockMedalReceipt({ slug, action, medalTitle })

  for (let index = 0; index < receipt.stages.length; index += 1) {
    receipt.currentStageIndex = index
    receipt.at = new Date().toISOString()
    onUpdate?.({ ...receipt })
    await sleep(receipt.stages[index].durationMs)
  }

  receipt.at = new Date().toISOString()
  return { ...receipt }
}
