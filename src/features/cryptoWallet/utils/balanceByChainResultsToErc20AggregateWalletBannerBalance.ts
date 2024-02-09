import BigDecimal from 'bignumber.js'
import { ChainMetadata } from 'features/caip'

import {
  AggregateWalletBannerBalanceErc20,
  AggregateWalletBannerBalanceType,
  BalanceByChainResult,
} from '../@types'
import { balanceByChainResultToValuation } from './balanceByChainResultToValuation'
import { isNativeToken } from './isNativeToken'

// Interrogates BalanceByChainResults in search specigically for ERC20s.
export function balanceByChainResultsToErc20AggregateWalletBannerBalance({
  balanceByChainResults,
  chainMetadatas,
}: {
  readonly balanceByChainResults: readonly BalanceByChainResult[]
  readonly chainMetadatas: readonly ChainMetadata[]
}): readonly AggregateWalletBannerBalanceErc20[] {
  return balanceByChainResults
    .filter((e) => !isNativeToken(e.asset))
    .filter((e) => e?.asset?.assetName?.namespace === 'ERC20')
    .flatMap(
      (
        balanceByChainResult: BalanceByChainResult
      ): readonly AggregateWalletBannerBalanceErc20[] => {
        const {
          asset: resource,
          balance: balanceInCurrencyUnits,
          label,
          token: { decimal: decimals, icon = null },
          symbol,
        } = balanceByChainResult

        const assetChain = chainMetadatas.find(
          (chain) =>
            chain.namespace === resource.chainId.namespace &&
            chain.reference === resource.chainId.reference
        )

        const balance = `${new BigDecimal(balanceInCurrencyUnits).multipliedBy(
          new BigDecimal(10).pow(decimals)
        )}` as `${number}`

        return [
          {
            resource,
            type: AggregateWalletBannerBalanceType.ERC_20,
            decimals,
            balance,
            symbol,
            icon,
            label,
            valuation: assetChain?.isMainnet
              ? balanceByChainResultToValuation({
                  balanceByChainResult,
                  balance,
                  decimals,
                })
              : null,
          },
        ]
      }
    )
}
