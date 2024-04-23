import { AggregateWalletBannerBalance } from 'features/cryptoWallet'

import { AmountWithMaybeCurrency } from '../types'
import { convertFromCryptoIntegerToDecimal } from './convertFromCryptoIntegerToDecimal'
import { convertFromCryptoToFiat } from './convertFromCryptoToFiat'

type ConvertFromCryptoIntegerToMaybeDecimalFiatProps = Partial<
  Pick<AggregateWalletBannerBalance, 'valuation' | 'decimals'>
> & {
  readonly integerCryptoAmount: string
}

export function convertFromCryptoIntegerToMaybeDecimalFiat({
  integerCryptoAmount,
  decimals,
  valuation: maybeValuation,
}: ConvertFromCryptoIntegerToMaybeDecimalFiatProps): AmountWithMaybeCurrency | null {
  if (!maybeValuation || typeof decimals !== 'number') return null

  const { currency } = maybeValuation

  if (!currency) return null

  const amount =
    !!maybeValuation &&
    convertFromCryptoToFiat({
      valueInCrypto: convertFromCryptoIntegerToDecimal({
        integerCryptoAmount,
        decimals,
      }),
      valuation: maybeValuation,
    })

  return { units: currency, amount }
}
