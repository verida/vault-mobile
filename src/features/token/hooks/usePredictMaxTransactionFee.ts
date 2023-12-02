import { ChainId } from 'caip'
import { BigNumber, ethers } from 'ethers'
import {
  calculateTransactionFeeEip155,
  getMaybeChainMetadatas,
  SupportedBlockchainNamespace,
  useChainMetadatas,
} from 'features/blockchain'
import { getRpcUrlOrThrow, isSupportedCaipNamespace } from 'features/caip'
import * as React from 'react'

import { GAS_TO_TRANSFER_NATIVE_CURRENCY } from '../constants'

type State = {
  readonly loading: boolean
  readonly error?: Error
  readonly predictedMaxTransactionFee: BigNumber | null
}

const loadingState = (): State => ({
  loading: true,
  predictedMaxTransactionFee: null,
})

export function usePredictMaxTransactionFee({
  // TODO: Note this is not valid for things like an ERC-20 send, which would require estimation.
  //       Future enhancement - extract the transaction generation so they can be first predicted
  //       before executed.
  amountOfGasConsumed:
    maybeAmountOfGasConsumed = GAS_TO_TRANSFER_NATIVE_CURRENCY,
  chainId,
}: {
  readonly amountOfGasConsumed?: BigNumber | null
  readonly chainId: ChainId
}): State {
  const [state, setState] = React.useState<State>(loadingState)

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  React.useEffect(
    () =>
      // eslint-disable-next-line no-void
      void (async () => {
        try {
          setState(loadingState)

          if (!maybeAmountOfGasConsumed)
            throw new Error('Unknown amount of gas consumed.')

          const { namespace } = chainId

          if (!isSupportedCaipNamespace(namespace))
            throw new Error(
              `Unable to predict transaction fee for "${namespace}".`
            )

          const rpc = await getRpcUrlOrThrow({
            chainId,
            chainMetadatas,
          })

          if (namespace === SupportedBlockchainNamespace.EIP_155) {
            const provider = new ethers.providers.JsonRpcProvider(rpc)
            const { maxFeePerGas } = await provider.getFeeData()

            // TODO: Here we could calculate non-EIP-155 prices.
            if (!maxFeePerGas)
              throw new Error(
                `Expected maxFeePerGas, encountered ${String(maxFeePerGas)}.`
              )

            // TODO: Note, this is an EIP-155 dependent calculation.
            const predictedMaxTransactionFee = calculateTransactionFeeEip155({
              maxFeePerGas,
              gasLimit: maybeAmountOfGasConsumed,
            })

            return setState({
              loading: false,
              predictedMaxTransactionFee,
            })
          }

          if (namespace === SupportedBlockchainNamespace.NEAR)
            throw new Error(
              'Transaction get estimate detection for NEAR is not yet supported.'
            )

          throw new Error(
            `Missing transaction fee estimates for "${namespace}".`
          )
        } catch (cause) {
          setState({
            loading: false,
            predictedMaxTransactionFee: null,
            error: new Error('Failed to predict maximum transaction fee.', {
              cause,
            }),
          })
        }
      })(),
    [maybeAmountOfGasConsumed, chainId, chainMetadatas]
  )

  return state
}
