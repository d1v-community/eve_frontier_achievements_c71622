import { isValidSuiAddress } from '@mysten/sui/utils'
import { getChronicleSnapshot } from '~~/server/chronicle/getSnapshot'
import { ENetwork } from '~~/types/ENetwork'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPORTED_NETWORKS = new Set(Object.values(ENetwork))

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
        {
          error: `network must be one of: ${Object.values(ENetwork).join(', ')}`,
        },
        { status: 400 }
      )
    }

    const snapshot = await getChronicleSnapshot(
      walletAddress,
      requestedNetwork as ENetwork
    )

    return json(snapshot)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to build chronicle snapshot'

    return json({ error: message }, { status: 500 })
  }
}
