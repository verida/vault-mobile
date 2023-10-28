import { ChainId, ChainIdParams } from 'caip'
import { useBlockchainContext } from 'features/blockchain'
import {
  sendBaseCurrencyEip155,
  useBlockchainRequestHandlersEip155,
} from 'features/blockchain/eip155'
import {
  sendBaseCurrencyNear,
  useBlockchainRequestHandlersNear,
} from 'features/blockchain/near'
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

type ConfirmTransactionCallbackParams = {
  readonly amount: number
  readonly toAddress: string
  readonly token: BalanceByChainResult
}

type ConfirmTransactionCallbackResult = boolean

type ConfirmTransactionCallback = (
  params: ConfirmTransactionCallbackParams
) => Promise<ConfirmTransactionCallbackResult>

// Lazily sends a transaction of the native currency.
// TODO: Use a more exciting ReturnType.
// TODO: Note this doesn't support ERC20s -> Is there an existing user flow which enables this?
export function useLazyConfirmTransaction(): Stateful<ConfirmTransactionCallbackResult> & {
  readonly confirmTransaction: ConfirmTransactionCallback
} {
  const [state, setState] = React.useState<
    Stateful<ConfirmTransactionCallbackResult>
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
    }: Omit<ConfirmTransactionCallbackParams, 'token'> &
      ChainIdParams & {
        readonly fromAddress: string
      }): Promise<ConfirmTransactionCallbackResult> => {
      const maybeMatchingAccount = selectedMinifiedAccounts.find(
        (e) =>
          e.namespace === namespace &&
          // TODO: This is not ideal
          fromAddress.toLowerCase() === e.address.toLowerCase()
      )

      if (!maybeMatchingAccount)
        throw new Error(
          `Unable to find matching selected account for "${fromAddress}".`
        )

      const chainId = new ChainId({ namespace, reference })

      const { rpcUrls } = getChainMetadataByCaipTypeOrThrow(
        chainMetadatas,
        chainId
      )

      const rpc = await rpcSelector(rpcUrls)

      if (typeof rpc !== 'string' || !rpc.length)
        throw new Error(`Expected non-empty string rpc, encounterd "${rpc}".`)

      switch (namespace) {
        case SupportedCaipNamespace.EIP_155:
          const { eth_sendTransaction } = blockchainRequestHandlersEip155

          await sendBaseCurrencyEip155({
            rpc,
            value: amount,
            to: toAddress,
            minifiedVeridaAccount: maybeMatchingAccount,
            eth_sendTransaction,
          })

          return true

        case SupportedCaipNamespace.NEAR:
          const { near_signAndSendTransaction } = blockchainRequestHandlersNear

          await sendBaseCurrencyNear({
            chainId,
            chainMetadatas,
            rpc,
            value: amount,
            to: toAddress,
            minifiedVeridaAccount: maybeMatchingAccount,
            near_signAndSendTransaction,
          })

          return true

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

  // TODO: Generalize to confirmTransaction when using ERC20s.
  const confirmTransaction: ConfirmTransactionCallback = React.useCallback(
    async ({
      amount,
      toAddress,
      token,
    }: ConfirmTransactionCallbackParams): Promise<boolean> => {
      const { loading } = state

      if (loading) throw new Error('Already loading!')

      try {
        if (!isNativeToken(token.token.asset))
          throw new Error(`Only base layer currencies are currently supported.`)

        const { chainId } = token.asset

        const { namespace, reference } = chainId

        const fromAddress = getWalletAddressForAsset(token.asset, wallets)

        if (typeof fromAddress !== 'string' || !fromAddress.length)
          throw new Error(
            `Expected non-empty string fromAddress, encountered "${fromAddress}".`
          )

        if (!isSupportedCaipNamespace(namespace))
          throw new Error(`Sorry, "${namespace}" is not a supported namespace.`)

        setState({ loading: true })

        const result = await executeBlockchainSpecificNativeTransactionOrThrow({
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

  return { ...state, confirmTransaction }
}
