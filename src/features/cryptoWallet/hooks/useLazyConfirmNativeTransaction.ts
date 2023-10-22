import { useBlockchainRequestHandlersEip155 } from 'features/blockchain/eip155'
import { isSupportedCaipNamespace, SupportedCaipNamespace } from 'features/caip'
import { Stateful } from 'features/polygonid/@types'
import * as React from 'react'

import { useAppSelector } from 'reduxStore/types'

import { BalanceByChainResult } from '../@types'
import { getWalletsData } from '../slice'
import { getWalletAddressForAsset, isNativeToken } from '../utils'

type ConfirmNativeTransactionCallbackParams = {
  readonly amount: number
  readonly toAddress: string
  readonly token: BalanceByChainResult
}

type ConfirmNativeTransactionCallbackResult = boolean

type ConfirmNativeTransactionCallback = (
  params: ConfirmNativeTransactionCallbackParams
) => Promise<ConfirmNativeTransactionCallbackResult>

// Lazily sends a transaction of the native currency.
// TODO: Use a more exciting ReturnType.
// TODO: Note this doesn't support ERC20s -> Is there an existing user flow which enables this?
export function useLazyConfirmNativeTransaction(): Stateful<ConfirmNativeTransactionCallbackResult> & {
  readonly confirmNativeTransaction: ConfirmNativeTransactionCallback
} {
  const [state, setState] = React.useState<
    Stateful<ConfirmNativeTransactionCallbackResult>
  >({ loading: false, result: false })

  const wallets = useAppSelector(getWalletsData)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const blockchainRequestHandlersEip155 = useBlockchainRequestHandlersEip155()

  //if (result.meta.requestStatus === 'rejected')
  //  throw new Error(String(result.payload))
  // TODO: Generalize to confirmTransaction when using ERC20s.
  const confirmNativeTransaction: ConfirmNativeTransactionCallback =
    React.useCallback(
      async ({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        amount,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        toAddress,
        token,
      }: ConfirmNativeTransactionCallbackParams): Promise<boolean> => {
        const { loading } = state

        if (loading) throw new Error('Already loading!')

        try {
          if (!isNativeToken(token.token.asset))
            throw new Error(
              `Only base layer currencies are currently supported.`
            )

          const { chainId } = token.asset

          const { namespace } = chainId

          const fromAddress = getWalletAddressForAsset(token.asset, wallets)

          if (typeof fromAddress !== 'string' || !fromAddress.length)
            throw new Error(
              `Expected non-empty string fromAddress, encountered "${fromAddress}".`
            )

          if (!isSupportedCaipNamespace(namespace))
            throw new Error(
              `Sorry, "${namespace}" is not a supported namespace.`
            )

          setState({ loading: true })

          // TODO: here we need to delegate to blockchain-specific hooks

          switch (namespace) {
            case SupportedCaipNamespace.EIP_155:
              // TODO: remember we need to wait for the transaction to be confirmed
              // TODO: remember break
              throw new Error('Not yet implemented!')
            case SupportedCaipNamespace.NEAR:
              // TODO: remember we need to wait for the transaction to be confirmed
              // TODO: remember break
              throw new Error('Not yet implemented!')
            default:
              // TODO: Turn into a static compilation error.
              throw new Error(
                `Internal error: Namespace ${namespace} is not supported.`
              )
          }
        } catch (cause) {
          // eslint-disable-next-line no-console
          __DEV__ && console.error(cause)

          setState({
            loading: false,
            error: new Error('Failed to send transaction.', {
              cause,
            }),
          })

          throw cause
        }
      },
      [wallets, state]
    )

  return { ...state, confirmNativeTransaction }
}
