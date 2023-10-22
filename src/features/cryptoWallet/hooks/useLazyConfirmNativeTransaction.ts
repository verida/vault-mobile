import { BN } from 'bn.js'
import { ChainId, ChainIdParams } from 'caip'
import { ethers } from 'ethers'
import {
  BlockchainRequestHandlerCallback,
  RpcSelector,
  useBlockchainContext,
} from 'features/blockchain'
import { useBlockchainRequestHandlersEip155 } from 'features/blockchain/eip155'
import {
  NearAccountBundle,
  useBlockchainRequestHandlersNear,
} from 'features/blockchain/near'
import {
  ChainMetadatas,
  getChainMetadataByCaipTypeOrThrow,
  getMaybeChainMetadatas,
  isSupportedCaipNamespace,
  SupportedCaipNamespace,
  useChainMetadatas,
} from 'features/caip'
import { Stateful } from 'features/polygonid/@types'
import { getMaybeNearAccountForPrivateKey } from 'features/walletConnect/utils/getMaybeNearAccountForWalletConnectRequest'
import { providers as nearProviders, utils as nearUtils } from 'near-api-js'
import * as React from 'react'

import { useAppSelector } from 'reduxStore/types'

import { BalanceByChainResult, MinifiedVeridaAccount } from '../@types'
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

const sendBaseCurrencyEip155 = async ({
  value,
  to,
  eth_sendTransaction,
  minifiedVeridaAccount,
  rpc,
}: {
  readonly to: string
  readonly value: number
  readonly eth_sendTransaction: BlockchainRequestHandlerCallback<ethers.Wallet>
  readonly minifiedVeridaAccount: MinifiedVeridaAccount
  readonly rpc: string
}) => {
  const { namespace } = minifiedVeridaAccount

  if (namespace !== SupportedCaipNamespace.EIP_155)
    throw new Error(
      `Expected "${SupportedCaipNamespace.EIP_155}", encountered "${namespace}".`
    )

  const { privateKey } = minifiedVeridaAccount

  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const maybeTransactionHash = await eth_sendTransaction({
    context: new ethers.Wallet(privateKey, provider),
    params: {
      value: ethers.utils.parseEther(String(value)),
      to,
    },
    // TODO: this should NOT be needed if we already have the provider... verify usage
    rpcSelector: async () => rpc /* already_selected */,
  })

  if (typeof maybeTransactionHash !== 'string' || !maybeTransactionHash.length)
    throw new Error(
      `Expected non-empty string transactionHash, encountered "${String(
        maybeTransactionHash
      )}".`
    )
}

const sendBaseCurrencyNear = async ({
  chainMetadatas,
  chainId: caipChainId,
  to: receiverId,
  value,
  near_signAndSendTransaction,
  rpc,
  minifiedVeridaAccount,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly chainId: ChainId
  readonly to: string
  readonly value: number
  readonly near_signAndSendTransaction: BlockchainRequestHandlerCallback<NearAccountBundle>
  readonly rpc: string
  readonly minifiedVeridaAccount: MinifiedVeridaAccount
}) => {
  const { namespace } = minifiedVeridaAccount

  if (namespace !== SupportedCaipNamespace.NEAR)
    throw new Error(
      `Expected "${SupportedCaipNamespace.NEAR}", encountered "${namespace}".`
    )

  const nearProvider = new nearProviders.JsonRpcProvider(rpc)

  const amount = nearUtils.format.parseNearAmount(String(value))

  if (typeof amount !== 'string' || !amount.length)
    throw new Error(
      `Expected non-empty string amount, encountered "${amount}".`
    )

  const { privateKey, address: signerId } = minifiedVeridaAccount

  // TODO: this should NOT be needed if we already have the provider... verify usage
  const rpcSelector: RpcSelector = async () => rpc

  const maybeNearAccount = await getMaybeNearAccountForPrivateKey({
    caipChainId,
    privateKey,
    signerId,
    chainMetadatas,
    rpcSelector,
  })

  if (!maybeNearAccount) throw new Error('Unable to find matching NearAccount.')

  const transaction = {
    actions: [
      {
        params: {
          deposit: new BN(amount).toString(),
        },
        type: 'Transfer',
      },
    ],
    receiverId,
    signerId,
  }

  return near_signAndSendTransaction({
    context: {
      nearAccount: maybeNearAccount,
      nearProvider,
    },
    params: {
      transaction,
    },
    rpcSelector,
  })
}

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
