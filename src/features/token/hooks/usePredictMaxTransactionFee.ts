import { ChainId } from 'caip'
import { BigNumber } from 'ethers'
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
  amountOfGasConsumed,
  chainId,
}: {
  readonly amountOfGasConsumed: BigNumber
  readonly chainId: ChainId
}): State {
  const [state, setState] = React.useState<State>(loadingState)

  React.useEffect(
    () =>
      // eslint-disable-next-line no-void
      void (async () => {
        try {
          setState(loadingState)

          // TODO: get rpcs
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
    [amountOfGasConsumed, chainId]
  )

  return state
}
