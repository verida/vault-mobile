import { isEmpty } from 'lodash'

import { BlockchainWalletWithAccounts } from '~/features/blockchain'

export const getUniqueWalletAddresses = (
  wallet: BlockchainWalletWithAccounts | null
) => {
  if (!wallet || isEmpty(wallet) || isEmpty(wallet.accounts)) return []

  const addresses: string[] = [
    ...new Set(
      Object.values(wallet.accounts).flatMap((account) => {
        // Ensure a valid chainId.
        if (typeof account.chainId !== 'string' || !account.chainId.length)
          return []

        return [`${account.chainId}:${account.address}`]
      })
    ),
  ]

  return addresses
}
