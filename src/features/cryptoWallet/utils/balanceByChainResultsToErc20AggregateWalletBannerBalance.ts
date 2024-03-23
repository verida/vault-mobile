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

        const correctedBalance = balanceInCurrencyUnits ?? 0
        const correctedDecimals = decimals ?? 18 // FIXME: This is a temporary fix for the rare case of missing decimals, usually because went wrong in Wallet Provider. We should not be defaulting to 18.

        if (correctedBalance === 0) {
          return []
        }

        const balance = `${new BigDecimal(correctedBalance).multipliedBy(
          new BigDecimal(10).pow(correctedDecimals)
        )}` as `${number}`

        return [
          {
            resource,
            type: AggregateWalletBannerBalanceType.ERC_20,
            decimals: correctedDecimals,
            balance,
            symbol,
            icon,
            label,
            valuation: assetChain?.isMainnet
              ? balanceByChainResultToValuation({
                  balanceByChainResult,
                  balance,
                  decimals: correctedDecimals,
                })
              : null,
          },
        ]
      }
    )
}
