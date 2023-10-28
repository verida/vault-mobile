import * as React from 'react'
import { useSelector } from 'react-redux'

import { AggregateWalletBannerBalances } from '../@types'
import { useGetBalancesQuery } from '../api'
import { getUniqueWalletAddresses, getWallets } from '../slice'

type State = Readonly<
  | { loading: true }
  | { loading: false; result: AggregateWalletBannerBalances }
  | { loading: false; error: Error }
>
export const getAggregateWalletBannerBalanceError = (
  state: State
): Error | undefined => {
  if (state.loading || !('error' in state)) return undefined

  return state.error
}

const DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES: AggregateWalletBannerBalances =
  Object.freeze([])

export const getAggregateWalletBannerBalanceResult = (
  state: State
): AggregateWalletBannerBalances => {
  if (state.loading || !('result' in state))
    return DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES

  return state.result
}

// Here we internalize the legacy mechanism for fetching wallet balances.
// This is dependent solely on the Wallet Provider as the arbiter of truth -
// however, the app is capable of integrating with custom networks which the
// Wallet Provider does not have an a priori awareness of. Instead, we lean
// on the Wallet Provider to return cached price information.
export function useAggregateWalletBannerBalances(): State & {
  readonly refetch: () => Promise<void>
} {
  const wallets = useSelector(getWallets)

  const {
    data: dataWalletProvider,
    isLoading: isLoadingWalletProvider,
    error: errorWalletProvider,
    refetch: refetchWalletProvider,
  } = useGetBalancesQuery(
    React.useMemo(() => getUniqueWalletAddresses(wallets), [wallets])
  )

  const state = React.useMemo<State>(() => {
    if (errorWalletProvider)
      return {
        loading: false,
        error: new Error('Failed to load balances from WalletProvider', {
          cause: errorWalletProvider,
        }),
      }

    if (isLoadingWalletProvider || !dataWalletProvider) return { loading: true }

    //const { list, total } = dataWalletProvider || {}

    return {
      loading: false,
      // TODO: implement me
      result: [],
    }
  }, [dataWalletProvider, isLoadingWalletProvider, errorWalletProvider])

  const refetch = React.useCallback(
    async (): Promise<void> =>
      Promise.all([refetchWalletProvider()]).then(() => undefined),
    [refetchWalletProvider]
  )

  return React.useMemo(() => ({ ...state, refetch }), [state, refetch])
}

// function useWalletBannerBalance() {
//   const wallets = useSelector(getWallets)

//   const { data, ...extras } = useGetBalancesQuery(
//     React.useMemo(() => getUniqueWalletAddresses(wallets), [wallets])
//   )

//   const { list, total } = data || {}

//   return { list, total, ...extras }
// }
