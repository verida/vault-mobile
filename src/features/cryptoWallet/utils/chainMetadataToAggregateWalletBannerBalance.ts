import { ChainId, ChainIdParams } from 'caip'
import { BigNumber } from 'ethers'
import { ChainMetadata } from 'features/caip'

import {
  AggregateWalletBannerBalanceNativeCurrency,
  AggregateWalletBannerBalanceType,
  BalanceByChainResult,
  CryptoWalletBalance,
  CryptoWalletBalances,
} from '../@types'
import { chainMetadataToMaybeValuation } from './chainMetadataToMaybeValuation'

// Converts a ChainMetadata into an equivalent AggregateWalletBannerBalance.
// Specifically, this takes a raw chain declaration and determines the balance
// for the caller on that chain.
export function chainMetadataToAggregateWalletBannerBalance({
  balanceByChainResults,
  chainMetadata,
  cryptoWalletBalances,
}: {
  readonly chainMetadata: ChainMetadata
  readonly balanceByChainResults: readonly BalanceByChainResult[]
  readonly cryptoWalletBalances: CryptoWalletBalances
}): AggregateWalletBannerBalanceNativeCurrency {
  const { reference, namespace, decimals, nativeCurrencyName, symbol, icon } =
    chainMetadata

  const chainId: ChainIdParams = {
    namespace,
    reference,
  }

  // Where defined, these balances are split across all of the currently
  // active accounts for the given chain. Since we are looking at the
  // aggregate balance, we merely add these together.
  const maybeBalances: CryptoWalletBalance | undefined =
    cryptoWalletBalances?.[new ChainId(chainId).toString()]

  const totalBalance = maybeBalances
    ? Object.values(maybeBalances)
        .flatMap((e) => (e ? [e] : []))
        .reduce((b: BigNumber, e: string) => b.add(e), BigNumber.from('0'))
    : BigNumber.from('0')

  const balance = totalBalance.toString() as `${number}`

  return {
    resource: chainId,
    type: AggregateWalletBannerBalanceType.NATIVE_CURRENCY,
    decimals,
    label: nativeCurrencyName,
    symbol,
    icon,
    balance,
    valuation: chainMetadataToMaybeValuation({
      balance,
      decimals,
      chainMetadata,
      balanceByChainResults,
    }),
  }
}
