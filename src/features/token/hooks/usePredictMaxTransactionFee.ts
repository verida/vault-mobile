import { ChainId } from 'caip'
import { BigNumber, ethers } from 'ethers'
import {
  calculateTransactionFeeEip155,
  useBlockchainContext,
} from 'features/blockchain'
import {
  getMaybeChainMetadatas,
  getRpcUrlOrThrow,
  isSupportedCaipNamespace,
  SupportedCaipNamespace,
  useChainMetadatas,
} from 'features/caip'
import * as React from 'react'

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
  amountOfGasConsumed: maybeAmountOfGasConsumed,
  chainId,
}: {
  readonly amountOfGasConsumed: BigNumber | null | undefined
  readonly chainId: ChainId
}): State {
  const [state, setState] = React.useState<State>(loadingState)

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const { rpcSelector } = useBlockchainContext()

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
            rpcSelector,
          })

          if (namespace === SupportedCaipNamespace.EIP_155) {
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

          if (namespace === SupportedCaipNamespace.NEAR)
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
    [maybeAmountOfGasConsumed, chainId, chainMetadatas, rpcSelector]
  )

  return state
}
