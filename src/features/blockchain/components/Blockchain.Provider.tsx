import * as React from 'react'

import { BlockchainContextValue } from '../@types'
import { BlockchainContextProvider } from '../contexts'

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
