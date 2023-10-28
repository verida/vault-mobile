import { ChainIdParams } from 'caip'
import { ChainMetadata } from 'features/caip'

import {
  AggregateWalletBannerBalanceBaseCurrency,
  AggregateWalletBannerBalanceType,
} from '../@types'

// Converts a ChainMetadata into an equivalent AggregateWalletBannerBalance.
// Specifically, this takes a raw chain declaration and determines the .
export function chainMetadataToAggregateWalletBannerBalance({
  chainMetadata,
}: {
  readonly chainMetadata: ChainMetadata
}): AggregateWalletBannerBalanceBaseCurrency {
  const { reference, namespace, decimals, nativeCurrencyName, symbol, icon } =
    chainMetadata
  const chainId: ChainIdParams = {
    namespace,
    reference,
  }

  return {
    resource: chainId,
    type: AggregateWalletBannerBalanceType.BASE_CURRENCY,
    decimals,
    label: nativeCurrencyName,
    symbol,
    icon,

    // TODO: determine balance
    balance: '0',
    // TODO: determine valuation
    valuation: null,
  }
}
