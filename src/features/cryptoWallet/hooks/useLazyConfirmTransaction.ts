import { AssetId, ChainId } from 'caip'
import { ethers } from 'ethers'
import {
  sendBaseCurrencyEip155,
  sendErc20Eip155,
  useBlockchainRequestHandlersEip155,
} from 'features/blockchain/eip155'
import {
  sendBaseCurrencyNear,
  useBlockchainRequestHandlersNear,
} from 'features/blockchain/near'
import {
  getMaybeChainMetadatas,
  getRpcUrlOrThrow,
  isSupportedCaipNamespace,
  SupportedCaipNamespace,
  useChainMetadatas,
} from 'features/caip'
import { Stateful } from 'features/polygonid/@types'
import * as React from 'react'

import {
  AggregateWalletBannerBalance,
  AggregateWalletBannerBalanceBaseCurrency,
  AggregateWalletBannerBalanceErc20,
  AggregateWalletBannerBalanceType,
} from '../@types'
import {
  getChainIdParamsFromResourceParams,
  getWalletAddressForChainId,
} from '../utils'
import { useSelectedMinifiedVeridaAccounts } from './useSelectedMinifiedVeridaAccounts'

type ConfirmTransactionCallbackParams<T extends AggregateWalletBannerBalance> =
  {
    readonly amount: number
    readonly toAddress: string
    readonly aggregateWalletBannerBalance: T
  }

type ConfirmTransactionCallbackResult = boolean

type ConfirmTransactionCallback<T extends AggregateWalletBannerBalance> = (
  params: ConfirmTransactionCallbackParams<T>
) => Promise<ConfirmTransactionCallbackResult>

type ExecuteLazyTransactionParams<
  T extends AggregateWalletBannerBalance = AggregateWalletBannerBalance
> = ConfirmTransactionCallbackParams<T> & {
  readonly fromAddress: string
}

// Lazily sends a transaction of the native currency.
// TODO: Use a more exciting ReturnType.
// TODO: Rename to respect that this does something more general.
// TODO: Note this doesn't support ERC20s -> Is there an existing user flow which enables this?
export function useLazyConfirmTransaction(): Stateful<ConfirmTransactionCallbackResult> & {
  readonly confirmTransaction: ConfirmTransactionCallback<AggregateWalletBannerBalance>
} {
  const [state, setState] = React.useState<
    Stateful<ConfirmTransactionCallbackResult>
  >({ loading: false, result: false })

  const blockchainRequestHandlersEip155 = useBlockchainRequestHandlersEip155()
  const blockchainRequestHandlersNear = useBlockchainRequestHandlersNear()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const selectedMinifiedAccounts = useSelectedMinifiedVeridaAccounts()

  // Attempts to collect all of the necessary data dependencies before
  // queuing a transaction.
  const getTransferContextOrThrow = React.useCallback(
    ({
      aggregateWalletBannerBalance,
      fromAddress,
    }: Pick<
      ExecuteLazyTransactionParams,
      'aggregateWalletBannerBalance' | 'fromAddress'
    >) => {
      const { resource } = aggregateWalletBannerBalance
      const { namespace, reference } =
        getChainIdParamsFromResourceParams(resource)

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

      const rpc = getRpcUrlOrThrow({ chainId, chainMetadatas })

      if (typeof rpc !== 'string' || !rpc.length)
        throw new Error(`Expected non-empty string rpc, encounterd "${rpc}".`)

      return { rpc, minifiedVeridaAccount: maybeMatchingAccount, chainId }
    },
    [chainMetadatas, selectedMinifiedAccounts]
  )

  const executeBlockchainSpecificNativeTransactionOrThrow = React.useCallback(
    async ({
      fromAddress,
      amount,
      toAddress,
      aggregateWalletBannerBalance,
    }: ExecuteLazyTransactionParams<AggregateWalletBannerBalanceBaseCurrency>): Promise<ConfirmTransactionCallbackResult> => {
      const { minifiedVeridaAccount, rpc, chainId } = getTransferContextOrThrow(
        {
          aggregateWalletBannerBalance,
          fromAddress,
        }
      )

      const { namespace } = chainId

      switch (namespace) {
        case SupportedCaipNamespace.EIP_155:
          const { eth_sendTransaction } = blockchainRequestHandlersEip155

          await sendBaseCurrencyEip155({
            rpc,
            value: amount,
            to: toAddress,
            minifiedVeridaAccount,
            eth_sendTransaction,
          })

          return true

        case SupportedCaipNamespace.NEAR:
          const { near_signAndSendTransaction } = blockchainRequestHandlersNear

          await sendBaseCurrencyNear({
            chainId,
            rpc,
            value: amount,
            to: toAddress,
            minifiedVeridaAccount,
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
      getTransferContextOrThrow,
      blockchainRequestHandlersEip155,
      blockchainRequestHandlersNear,
    ]
  )

  const executeBlockchainSpecificErc20TransactionOrThrow = React.useCallback(
    async ({
      fromAddress,
      toAddress: to,
      amount,
      aggregateWalletBannerBalance,
    }: ExecuteLazyTransactionParams<AggregateWalletBannerBalanceErc20>): Promise<ConfirmTransactionCallbackResult> => {
      const { resource, decimals } = aggregateWalletBannerBalance
      const { minifiedVeridaAccount, rpc, chainId } = getTransferContextOrThrow(
        {
          aggregateWalletBannerBalance,
          fromAddress,
        }
      )

      const { namespace } = chainId

      const maybeErc20Address = new AssetId(resource).assetName?.reference

      switch (namespace) {
        case SupportedCaipNamespace.EIP_155:
          const { eth_sendTransaction } = blockchainRequestHandlersEip155

          if (!ethers.utils.isAddress(maybeErc20Address))
            throw new Error(
              `Expected address erc20Address, encountered "${String(
                maybeErc20Address
              )}".`
            )

          await sendErc20Eip155({
            erc20Address: maybeErc20Address,
            to,
            value: amount,
            eth_sendTransaction,
            minifiedVeridaAccount,
            rpc,
            decimals,
          })

          return true
        default:
          throw new Error(
            `Sending ERC-20s on ${namespace} is not yet supported. Please accept our apologies for the inconvenience!`
          )
      }
    },
    [blockchainRequestHandlersEip155, getTransferContextOrThrow]
  )

  // TODO: Generalize to confirmTransaction when using ERC20s.
  const confirmTransaction: ConfirmTransactionCallback<AggregateWalletBannerBalance> =
    React.useCallback(
      async ({
        amount,
        toAddress,
        aggregateWalletBannerBalance,
      }: ConfirmTransactionCallbackParams<AggregateWalletBannerBalance>): Promise<ConfirmTransactionCallbackResult> => {
        const { loading } = state

        if (loading) throw new Error('Already loading!')

        try {
          const { resource } = aggregateWalletBannerBalance
          const chainIdParams = getChainIdParamsFromResourceParams(resource)

          const { namespace } = chainIdParams

          const fromAddress = getWalletAddressForChainId(
            new ChainId(chainIdParams),
            selectedMinifiedAccounts
          )

          if (typeof fromAddress !== 'string' || !fromAddress.length)
            throw new Error(
              `Expected non-empty string fromAddress, encountered "${fromAddress}".`
            )

          if (!isSupportedCaipNamespace(namespace))
            throw new Error(
              `Sorry, "${namespace}" is not a supported namespace.`
            )

          setState({ loading: true })

          const { type } = aggregateWalletBannerBalance

          const params: Omit<
            ExecuteLazyTransactionParams<AggregateWalletBannerBalance>,
            'aggregateWalletBannerBalance'
          > = {
            amount,
            fromAddress,
            toAddress,
          }

          const result: ConfirmTransactionCallbackResult =
            type === AggregateWalletBannerBalanceType.BASE_CURRENCY
              ? await executeBlockchainSpecificNativeTransactionOrThrow({
                  ...params,
                  aggregateWalletBannerBalance,
                })
              : type === AggregateWalletBannerBalanceType.ERC_20
              ? await executeBlockchainSpecificErc20TransactionOrThrow({
                  ...params,
                  aggregateWalletBannerBalance,
                })
              : false

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
      [
        state,
        selectedMinifiedAccounts,
        executeBlockchainSpecificNativeTransactionOrThrow,
        executeBlockchainSpecificErc20TransactionOrThrow,
      ]
    )

  return { ...state, confirmTransaction }
}
