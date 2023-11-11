import * as React from 'react'

import { CryptoWalletCawfreeContextValue } from '../@types'

const CryptoWalletCawfreeContext =
  React.createContext<CryptoWalletCawfreeContextValue | null>(null)

export const CryptoWalletContextCawfreeProvider =
  CryptoWalletCawfreeContext.Provider

export function useCryptoWalletCawfreeContext(): CryptoWalletCawfreeContextValue {
  const maybeContext = React.useContext(CryptoWalletCawfreeContext)

  if (!maybeContext)
    throw new Error('Missing <CryptoWalletCawfreeContextProvider />!')

  return maybeContext
}
