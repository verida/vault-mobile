import BigDecimal from 'bignumber.js'
import { ChainId, ChainIdParams } from 'caip'
import { BigNumber } from 'ethers'

import { ChainMetadata } from '~/features/caip'

import {
  AggregateWalletBannerBalanceNativeCurrency,
  AggregateWalletBannerBalanceType,
  BalanceByChainResult,
  CryptoWalletBalance,
  CryptoWalletBalances,
} from '../types'
import { chainMetadataToMaybeValuation } from './chainMetadataToMaybeValuation'
import { isNativeToken } from './isNativeToken'

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
  const {
    reference,
    namespace,
    decimals,
    nativeCurrencyName,
    symbol,
    icon,
    isMainnet,
  } = chainMetadata

  const chainId: ChainIdParams = {
    namespace,
    reference,
  }

  const maybeBalanceFromWalletProvider = balanceByChainResults
    .filter(
      (e) =>
        namespace === e.asset.chainId.namespace &&
        reference === e.asset.chainId.reference
    )
    .find((e) => isNativeToken(e.asset))

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

  // FIXME: The balance coming directly from the RPCs (cryptoWalletBalances) seem to be '0' on mainnet (ethereum and polygon), so we are using the balance from the wallet provider (maybeBalanceFromWalletProvider) as a fallback. This is a temporary fix, and we should investigate why the balance is '0' on mainnet.
  const balance = maybeBalanceFromWalletProvider?.balance
    ? (`${new BigDecimal(maybeBalanceFromWalletProvider.balance).multipliedBy(
        new BigDecimal(10).pow(decimals)
      )}` as `${number}`)
    : (totalBalance.toString() as `${number}`)

  return {
    resource: chainId,
    type: AggregateWalletBannerBalanceType.NATIVE_CURRENCY,
    decimals,
    label: nativeCurrencyName,
    symbol,
    icon,
    balance,
    valuation: isMainnet
      ? chainMetadataToMaybeValuation({
          balance,
          decimals,
          chainMetadata,
          balanceByChainResults,
        })
      : null,
  }
}
