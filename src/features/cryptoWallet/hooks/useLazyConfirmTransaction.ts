import { AssetType, ChainId } from 'caip'
import { ethers } from 'ethers'
import * as React from 'react'

import {
  getMaybeChainMetadatas,
  getRpcUrlOrThrow,
  SupportedBlockchainNamespace,
  useChainMetadatas,
} from '~/features/blockchain'
import {
  sendErc20Eip155,
  sendNativeCurrencyEip155,
  useBlockchainRequestHandlersEip155,
} from '~/features/blockchain/eip155'
import {
  sendNativeCurrencyNear,
  useBlockchainRequestHandlersNear,
} from '~/features/blockchain/near'
import { Logger } from '~/features/telemetry'
import { Stateful } from '~/types'

import { useCryptoWalletBalanceContext } from '../contexts'
import {
  AggregateWalletBannerBalance,
  AggregateWalletBannerBalanceErc20,
  AggregateWalletBannerBalanceNativeCurrency,
  AggregateWalletBannerBalanceType,
} from '../types'
import {
  getChainIdParamsFromResourceParams,
  getFromAddressForResourceOrThrow,
} from '../utils'
import { useSelectedMinifiedBlockchainAccounts } from './useSelectedMinifiedBlockchainAccounts'

const logger = Logger.create('useLazyConfirmTransaction')

type ConfirmTransactionCallbackParams<T extends AggregateWalletBannerBalance> =
  {
    readonly amount: number
    readonly toAddress: string
    readonly aggregateWalletBannerBalance: T
  }

export type ConfirmTransactionCallbackResult = {
  readonly transactionHash: string
}

type ConfirmTransactionCallback<T extends AggregateWalletBannerBalance> = (
  params: ConfirmTransactionCallbackParams<T>
) => Promise<ConfirmTransactionCallbackResult>

type ExecuteLazyTransactionParams<
  T extends AggregateWalletBannerBalance = AggregateWalletBannerBalance,
> = ConfirmTransactionCallbackParams<T> & {
  readonly fromAddress: string
}

// Lazily sends a transaction of the native currency.
// TODO: Use a more exciting ReturnType.
// TODO: Rename to respect that this does something more general.
// TODO: Note this doesn't support ERC20s -> Is there an existing user flow which enables this?
export function useLazyConfirmTransaction(): Stateful<ConfirmTransactionCallbackResult | null> & {
  readonly confirmTransaction: ConfirmTransactionCallback<AggregateWalletBannerBalance>
} {
  const [state, setState] = React.useState<
    Stateful<ConfirmTransactionCallbackResult | null>
  >({ loading: false, result: null })

  const blockchainRequestHandlersEip155 = useBlockchainRequestHandlersEip155()
  const blockchainRequestHandlersNear = useBlockchainRequestHandlersNear()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const selectedMinifiedAccounts = useSelectedMinifiedBlockchainAccounts()

  const { refetch } = useCryptoWalletBalanceContext()

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

      return { rpc, minifiedBlockchainAccount: maybeMatchingAccount, chainId }
    },
    [chainMetadatas, selectedMinifiedAccounts]
  )

  const executeBlockchainSpecificNativeTransactionOrThrow = React.useCallback(
    async ({
      fromAddress,
      amount,
      toAddress,
      aggregateWalletBannerBalance,
    }: ExecuteLazyTransactionParams<AggregateWalletBannerBalanceNativeCurrency>): Promise<ConfirmTransactionCallbackResult> => {
      const { minifiedBlockchainAccount, rpc, chainId } =
        getTransferContextOrThrow({
          aggregateWalletBannerBalance,
          fromAddress,
        })

      const { namespace } = chainId

      switch (namespace) {
        case SupportedBlockchainNamespace.EIP_155:
          const { eth_sendTransaction } = blockchainRequestHandlersEip155

          return sendNativeCurrencyEip155({
            rpc,
            value: amount,
            to: toAddress,
            minifiedBlockchainAccount,
            eth_sendTransaction,
            chainId,
          })

        case SupportedBlockchainNamespace.NEAR:
          const { near_signAndSendTransaction } = blockchainRequestHandlersNear

          return sendNativeCurrencyNear({
            chainId,
            rpc,
            value: amount,
            to: toAddress,
            minifiedBlockchainAccount,
            near_signAndSendTransaction,
          })

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
      const { minifiedBlockchainAccount, rpc, chainId } =
        getTransferContextOrThrow({
          aggregateWalletBannerBalance,
          fromAddress,
        })

      const { namespace } = chainId

      const maybeErc20Address = new AssetType(resource).assetName?.reference

      switch (namespace) {
        case SupportedBlockchainNamespace.EIP_155:
          const { eth_sendTransaction } = blockchainRequestHandlersEip155

          if (!ethers.utils.isAddress(maybeErc20Address))
            throw new Error(
              `Expected address erc20Address, encountered "${String(
                maybeErc20Address
              )}".`
            )

          return sendErc20Eip155({
            erc20Address: maybeErc20Address,
            to,
            value: amount,
            eth_sendTransaction,
            minifiedBlockchainAccount,
            rpc,
            decimals,
            chainId: chainId.toString(),
          })

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

          const { fromAddress } = getFromAddressForResourceOrThrow({
            selectedMinifiedAccounts,
            resource,
          })

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

          const result: ConfirmTransactionCallbackResult | null =
            type === AggregateWalletBannerBalanceType.NATIVE_CURRENCY
              ? await executeBlockchainSpecificNativeTransactionOrThrow({
                  ...params,
                  aggregateWalletBannerBalance,
                })
              : type === AggregateWalletBannerBalanceType.ERC_20
                ? await executeBlockchainSpecificErc20TransactionOrThrow({
                    ...params,
                    aggregateWalletBannerBalance,
                  })
                : null

          if (!result)
            throw new Error(
              `Failed to determine result for wallet balance type "${type}".`
            )

          await refetch()

          setState({ loading: false, result })

          return result
        } catch (cause) {
          logger.error(cause)

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
        refetch,
        state,
        selectedMinifiedAccounts,
        executeBlockchainSpecificNativeTransactionOrThrow,
        executeBlockchainSpecificErc20TransactionOrThrow,
      ]
    )

  return { ...state, confirmTransaction }
}
