import { ChainMetadataRpcs } from 'features/caip'
import * as React from 'react'

import { BlockchainContextValue, RpcSelector } from '../@types'
import { BlockchainContextProvider } from '../contexts'

export const BlockchainProvider = React.memo(function BlockchainProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  // TODO: Here we can create the ability to allow the user to select which RPC
  //       to use for their transactions. For simplicity, we just pick the first for now,
  //       (this is equivalent to how the app originally behaved) but this can now become a
  //       function of state instead, allowing users to select their RPCs for different chains.
  const rpcSelector: RpcSelector = React.useCallback(
    async (rpcUrls: ChainMetadataRpcs): Promise<string> => {
      const [maybeRpcUrl] = rpcUrls

      if (typeof maybeRpcUrl !== 'string' || !maybeRpcUrl.length)
        throw new Error(
          `Expected non-empty string rpcUrl, encountered "${String(
            maybeRpcUrl
          )}".`
        )

      return maybeRpcUrl
    },
    []
  )
  return (
    <BlockchainContextProvider
      children={children}
      value={React.useMemo<BlockchainContextValue>(
        () => ({ rpcSelector }),
        [rpcSelector]
      )}
    />
  )
})
