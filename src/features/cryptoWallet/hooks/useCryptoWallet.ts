import { CryptoWalletContext } from 'features/cryptoWallet/contexts'
import { useContext } from 'react'

export function useCryptoWallet() {
  const contextValue = useContext(CryptoWalletContext)
  if (contextValue === null) {
    throw new Error(
      'useCryptoWallet must be used within a CryptoWalletProvider'
    )
  }
  return contextValue
}
