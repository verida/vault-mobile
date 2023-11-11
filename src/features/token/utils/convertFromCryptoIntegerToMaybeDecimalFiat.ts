import {
  AggregateWalletBannerBalance,
  CURRENCY_SYMBOLS,
} from 'features/cryptoWallet'

import { convertFromCryptoIntegerToDecimal } from './convertFromCryptoIntegerToDecimal'
import { convertFromCryptoToFiat } from './convertFromCryptoToFiat'

export function convertFromCryptoIntegerToMaybeDecimalFiat({
  integerCryptoAmount,
  aggregateWalletBannerBalance,
}: {
  readonly integerCryptoAmount: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}) {
  const { decimals, valuation: maybeValuation } = aggregateWalletBannerBalance

  if (!maybeValuation) return null

  const maybeFiatSymbol =
    !!maybeValuation && CURRENCY_SYMBOLS[maybeValuation.currency]

  if (!maybeFiatSymbol) return null

  const fiatAmount =
    !!maybeValuation &&
    convertFromCryptoToFiat({
      valueInCrypto: convertFromCryptoIntegerToDecimal({
        integerCryptoAmount,
        decimals,
      }),
      valuation: maybeValuation,
      decimalPlaces: 2,
    })

  return {
    fiatSymbol: maybeFiatSymbol,
    fiatAmount,
  }
}
