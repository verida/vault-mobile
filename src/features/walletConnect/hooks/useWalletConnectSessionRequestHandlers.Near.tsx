import {
  NearRpcMethod,
  useBlockchainRequestHandlersNear,
} from 'features/blockchain/near'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/caip'
import { useSelectedMinifiedVeridaAccounts } from 'features/cryptoWallet'
import {
  extractWalletConnectRpcOrThrow,
  getNearAccountForWalletConnectRequestOrThrow,
} from 'features/walletConnect'
import { providers } from 'near-api-js'
import * as React from 'react'
import { $enum } from 'ts-enum-util'

import {
  NearSessionRequestHandlers,
  WalletConnectSessionRequestCallbackParams,
} from '../@types'

// TODO: we need to leverage walletconnect's implementation rather than rolling
//       our own copies each time - we should be adapting a common interface

const getNearProvider = (rpc: string) => new providers.JsonRpcProvider(rpc)

export function useWalletConnectSessionRequestHandlersNear(): NearSessionRequestHandlers {
  const minifiedVeridaAccounts = useSelectedMinifiedVeridaAccounts()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const blockchainRequestHandlersNear = useBlockchainRequestHandlersNear()

  return React.useMemo<NearSessionRequestHandlers>(
    () =>
      Object.fromEntries(
        [...$enum(NearRpcMethod).values()].map(
          (nearRpcMethod: NearRpcMethod) => [
            nearRpcMethod,
            async ({
              request,
              web3wallet,
            }: WalletConnectSessionRequestCallbackParams) => {
              const provider = getNearProvider(
                await extractWalletConnectRpcOrThrow({
                  chainMetadatas,
                  request,
                })
              )

              const nearAccount =
                await getNearAccountForWalletConnectRequestOrThrow({
                  web3wallet,
                  minifiedVeridaAccounts,
                  request,
                })

              return blockchainRequestHandlersNear[nearRpcMethod]({
                context: {
                  nearAccount,
                  nearProvider: provider,
                },
                params: request.params.request.params,
              })
            },
          ]
        )
      ) as NearSessionRequestHandlers,
    [chainMetadatas, blockchainRequestHandlersNear, minifiedVeridaAccounts]
  )
}
