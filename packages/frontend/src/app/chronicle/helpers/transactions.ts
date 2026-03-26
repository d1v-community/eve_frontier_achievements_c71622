import { Transaction } from '@mysten/sui/transactions'
import { fullFunctionName } from '~~/helpers/network'

export const prepareClaimMedalTransaction = (
  packageId: string,
  registryObjectId: string,
  medalKind: number,
  proof: string
): Transaction => {
  const tx = new Transaction()

  tx.moveCall({
    target: fullFunctionName(packageId, 'claim_medal'),
    arguments: [
      tx.object(registryObjectId),
      tx.pure.u8(medalKind),
      tx.pure.string(proof),
    ],
  })

  return tx
}
