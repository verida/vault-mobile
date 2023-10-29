import * as React from 'react'

import { CryptoWalletContextValue } from '../@types'

const CryptoWalletContext =
  React.createContext<CryptoWalletContextValue | null>(null)

export const CryptoWalletContextProvider = CryptoWalletContext.Provider

export function useCryptoWalletContext(): CryptoWalletContextValue {
  const maybeContext = React.useContext(CryptoWalletContext)

  if (!maybeContext) throw new Error('Missing <CryptoWalletContextProvider />!')

  return maybeContext
}
