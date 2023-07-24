import { ethers } from 'ethers'

export function getNearAccountId({
  // XXX: Near account addresses are synonymous with transaction signerIds.
  signerId: nearAccountAddress,
}: {
  readonly signerId: string
}) {
  // https://docs.near.org/concepts/basics/accounts/account-id

  // HACK: Deterministic account creation. Note, account names based upon length
  //       are treated differently by NEAR, specifically:

  // 1. Only the registrar account can create short top-level accounts (<32 char).
  // 2. Anyone can create long (>= 32 chars) top-level accounts.

  // Here we create a long account to satisfy the >32 byte allocation constraint.
  return `dev-vda-${ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes(nearAccountAddress))
    .substring(2, 32)}`
}
