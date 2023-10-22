import { ChainId, ChainIdParams } from 'caip'
import { ethers } from 'ethers'
import { useBlockchainContext } from 'features/blockchain'
import { useBlockchainRequestHandlersEip155 } from 'features/blockchain/eip155'
import { useBlockchainRequestHandlersNear } from 'features/blockchain/near'
import {
  getChainMetadataByCaipTypeOrThrow,
  getMaybeChainMetadatas,
  isSupportedCaipNamespace,
  SupportedCaipNamespace,
  useChainMetadatas,
} from 'features/caip'
import { Stateful } from 'features/polygonid/@types'
import * as React from 'react'

import { useAppSelector } from 'reduxStore/types'

import { BalanceByChainResult } from '../@types'
import { getWalletsData } from '../slice'
import { getWalletAddressForAsset, isNativeToken } from '../utils'
import { useSelectedMinifiedVeridaAccounts } from './useSelectedMinifiedVeridaAccounts'

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
  const { rpcSelector } = useBlockchainContext()

  const blockchainRequestHandlersEip155 = useBlockchainRequestHandlersEip155()
  const blockchainRequestHandlersNear = useBlockchainRequestHandlersNear()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const selectedMinifiedAccounts = useSelectedMinifiedVeridaAccounts()

  const executeBlockchainSpecificNativeTransactionOrThrow = React.useCallback(
    async ({
      fromAddress,
      amount,
      toAddress,
      namespace,
      reference,
    }: Omit<ConfirmNativeTransactionCallbackParams, 'token'> &
      ChainIdParams & {
        readonly fromAddress: string
      }): Promise<ConfirmNativeTransactionCallbackResult> => {
      switch (namespace) {
        case SupportedCaipNamespace.EIP_155:
          const maybeMatchingAccount = selectedMinifiedAccounts.find(
            (e) =>
              e.namespace === namespace &&
              ethers.utils.getAddress(fromAddress) ===
                ethers.utils.getAddress(e.address)
          )

          if (!maybeMatchingAccount)
            throw new Error(
              `Unable to find matching selected account for "${fromAddress}".`
            )

          const { rpcUrls } = getChainMetadataByCaipTypeOrThrow(
            chainMetadatas,
            new ChainId({ namespace, reference })
          )

          const provider = new ethers.providers.JsonRpcProvider(
            await rpcSelector(rpcUrls)
          )

          await blockchainRequestHandlersEip155.eth_sendTransaction({
            context: new ethers.Wallet(
              maybeMatchingAccount.privateKey,
              provider
            ),
            params: {
              value: ethers.utils.parseEther(String(amount)),
              to: toAddress,
            },
            rpcSelector,
          })

          return true

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
    },
    [
      blockchainRequestHandlersEip155,
      rpcSelector,
      selectedMinifiedAccounts,
      chainMetadatas,
      blockchainRequestHandlersNear,
    ]
  )

  //if (result.meta.requestStatus === 'rejected')
  //  throw new Error(String(result.payload))
  // TODO: Generalize to confirmTransaction when using ERC20s.
  const confirmNativeTransaction: ConfirmNativeTransactionCallback =
    React.useCallback(
      async ({
        amount,
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

          const { namespace, reference } = chainId

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

          const result =
            await executeBlockchainSpecificNativeTransactionOrThrow({
              namespace,
              reference,
              amount,
              fromAddress,
              toAddress,
            })

          // TODO: we need to tell if the transaction was successfully mined or not
          setState({ loading: false, result })

          return result
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
      [state, wallets, executeBlockchainSpecificNativeTransactionOrThrow]
    )

  return { ...state, confirmNativeTransaction }
}
