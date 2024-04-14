import * as React from 'react'

import { BlockchainContextProvider } from '../contexts'
import { BlockchainContextValue } from '../types'

export const BlockchainProvider = React.memo(function BlockchainProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  return (
    <BlockchainContextProvider
      children={children}
      value={React.useMemo<BlockchainContextValue>(() => ({}), [])}
    />
  )
})
