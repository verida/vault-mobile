import * as React from 'react'

import { WalletConnectContextValue } from '../types'

const WalletConnectContext =
  React.createContext<WalletConnectContextValue | null>(null)

export const WalletConnectContextProvider = WalletConnectContext.Provider

export function useWalletConnectContext(): WalletConnectContextValue {
  const maybeContext = React.useContext(WalletConnectContext)

  if (!maybeContext)
    throw new Error('Missing <WalletConnectContextProvider />!')

  return maybeContext
}
