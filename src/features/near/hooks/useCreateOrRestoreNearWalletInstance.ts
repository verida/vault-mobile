import {
  createNearWalletInstance,
  NearNetworkId,
  NearWalletAccountInfo,
  NearWalletInstance,
  useMaybeNearWalletData,
} from 'features/near'
import * as React from 'react'

type State = Readonly<
  | { loading: true }
  | {
      loading: false
      nearWalletInstance: NearWalletInstance
      nearWalletAccounts: readonly NearWalletAccountInfo[]
    }
  | { loading: false; error: Error }
>

const loadingState = (): State => ({ loading: true })

export function useMaybeNearWalletInstance(
  state: State
): NearWalletInstance | undefined {
  if (state.loading || !('nearWalletInstance' in state)) return undefined

  return state.nearWalletInstance
}

export function useMaybeNearWalletAccounts(
  state: State
): readonly NearWalletAccountInfo[] | undefined {
  if (state.loading || !('nearWalletAccounts' in state)) return undefined

  return state.nearWalletAccounts
}

export function useCreateOrRestoreNearWalletInstance({
  nearNetwork,
}: {
  readonly nearNetwork: NearNetworkId
}): State {
  const [state, setState] = React.useState<State>(loadingState)

  // The lifetime of the Near Wallet is defined by Redux state.
  const maybeNearWalletData = useMaybeNearWalletData()

  React.useEffect(
    () =>
      void (async () => {
        setState(loadingState)

        try {
          if (!maybeNearWalletData)
            throw new Error('No near address available!')

          const { privateKey, publicKey } = maybeNearWalletData

          if (typeof privateKey !== 'string' || !privateKey.length)
            throw new Error(
              `Expected non-empty string privateKey, encountered: ${typeof privateKey}`
            )

          if (typeof publicKey !== 'string' || !publicKey.length)
            throw new Error(
              `Expected non-empty string publicKey, encountered: ${String(
                publicKey
              )}`
            )

          const { nearWalletInstance, nearWalletAccounts } =
            await createNearWalletInstance({
              privateKey,
              publicKey,
              networkId: nearNetwork,
            })

          return setState({
            loading: false,
            nearWalletInstance,
            nearWalletAccounts,
          })
        } catch (cause) {
          // eslint-disable-next-line no-console
          __DEV__ && console.error(cause)
          setState({
            loading: false,
            error: new Error('Unable to create or restore NearWallet.', {
              cause,
            }),
          })
        }
      })(),
    [maybeNearWalletData, nearNetwork]
  )

  return state
}
