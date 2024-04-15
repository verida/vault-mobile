import * as React from 'react'

import { CryptoWalletBalanceContextValue } from '../types'

const CryptoWalletBalanceContext =
  React.createContext<CryptoWalletBalanceContextValue | null>(null)

export const CryptoWalletContextBalanceProvider =
  CryptoWalletBalanceContext.Provider

export function useCryptoWalletBalanceContext(): CryptoWalletBalanceContextValue {
  const maybeContext = React.useContext(CryptoWalletBalanceContext)

  if (!maybeContext)
    throw new Error('Missing <CryptoWalletContextBalanceProvider />!')

  return maybeContext
}
