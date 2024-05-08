import * as React from 'react'

import { BlockchainContextValue } from '../types'

const BlockchainContext = React.createContext<BlockchainContextValue | null>(
  null
)

export const BlockchainContextProvider = BlockchainContext.Provider

export function useBlockchainContext(): BlockchainContextValue {
  const maybeContext = React.useContext(BlockchainContext)

  if (!maybeContext) throw new Error(`Missing <BlockchainContextProvider />!`)

  return maybeContext
}
