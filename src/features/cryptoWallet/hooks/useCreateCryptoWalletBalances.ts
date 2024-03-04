import { getMaybeChainMetadatas, useChainMetadatas } from 'features/blockchain'
import { Logger } from 'features/telemetry'
import * as React from 'react'

import {
  CryptoWalletBalances,
  UseCreateCryptoWalletBalancesResult,
  UseCreateCryptoWalletBalancesState,
} from '../@types'
import { fetchCryptoWalletBalances } from '../utils'
import { useSelectedMinifiedBlockchainAccounts } from './useSelectedMinifiedBlockchainAccounts'

const logger = Logger.create('useCreateCryptoWalletBalances')

const DEFAULT_CRYPTO_WALLET_BALANCES: CryptoWalletBalances = {}

export const getMaybeCreateCryptoWalletBalancesResult = (
  state: UseCreateCryptoWalletBalancesState
) => {
  if (state.loading || !('data' in state)) return DEFAULT_CRYPTO_WALLET_BALANCES

  return state.data
}

export function useCreateCryptoWalletBalances(): UseCreateCryptoWalletBalancesResult {
  const [state, setState] = React.useState<UseCreateCryptoWalletBalancesState>({
    loading: true,
  })

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const minifiedAccounts = useSelectedMinifiedBlockchainAccounts()

  const shouldRefetch =
    React.useCallback(async (): Promise<CryptoWalletBalances> => {
      // If there's nothing to fetch, terminate early.
      if (!chainMetadatas?.length || !minifiedAccounts?.length) return {}

      // Else, fetch native balances for each network.
      return fetchCryptoWalletBalances({
        chainMetadatas,
        minifiedAccounts,
      })
    }, [chainMetadatas, minifiedAccounts])

  const refetch = React.useCallback(async () => {
    try {
      setState({ loading: true })

      const data = await shouldRefetch()

      setState({
        loading: false,
        data,
      })

      return data
    } catch (cause) {
      setState({
        loading: false,
        error: new Error('Failed to refetch CryptoWalletBalances.', { cause }),
      })
      throw cause
    }
  }, [shouldRefetch])

  // HACK: Whenever the refetch method is reallocated, we'll automatically
  //       refetch to remain up-to-date with the latest configuration.
  // eslint-disable-next-line no-void
  React.useEffect(() => void refetch().catch(logger.error), [refetch])

  return React.useMemo<UseCreateCryptoWalletBalancesResult>(
    () => ({ ...state, refetch }),
    [refetch, state]
  )
}
