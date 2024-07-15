import { useContext } from 'react'

import { CryptoWalletContext } from '~/features/cryptoWallet/contexts'

export function useCryptoWallet() {
  const contextValue = useContext(CryptoWalletContext)
  if (contextValue === null) {
    throw new Error(
      'useCryptoWallet must be used within a CryptoWalletProvider'
    )
  }
  return contextValue
}
