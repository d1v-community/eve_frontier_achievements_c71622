import { Transaction } from '@mysten/sui/transactions'
import { fullFunctionName } from '~~/helpers/network'
import type { ChronicleClaimTicket } from '../types'

export const prepareClaimMedalTransaction = (
  packageId: string,
  registryObjectId: string,
  claimTicket: ChronicleClaimTicket
): Transaction => {
  const tx = new Transaction()
  const decodeBase64 = (value: string) =>
    Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

  tx.moveCall({
    target: fullFunctionName(packageId, 'claim_medal'),
    arguments: [
      tx.object(registryObjectId),
      tx.object(claimTicket.templateObjectId),
      tx.pure.vector('u8', decodeBase64(claimTicket.proofDigestBase64)),
      tx.pure.string(claimTicket.evidenceUri),
      tx.pure.u64(claimTicket.issuedAtMs),
      tx.pure.u64(claimTicket.deadlineMs),
      tx.pure.vector('u8', decodeBase64(claimTicket.nonceBase64)),
      tx.pure.vector('u8', decodeBase64(claimTicket.signerPublicKeyBase64)),
      tx.pure.vector('u8', decodeBase64(claimTicket.signatureBase64)),
    ],
  })

  return tx
}

export const prepareMintMedalNftTransaction = (
  packageId: string,
  registryObjectId: string,
  templateObjectId: string
): Transaction => {
  const tx = new Transaction()

  tx.moveCall({
    target: fullFunctionName(packageId, 'mint_medal_nft'),
    arguments: [tx.object(registryObjectId), tx.object(templateObjectId)],
  })

  return tx
}
