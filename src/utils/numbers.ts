import { DEFAULT_FIAT_CURRENCY } from 'constants/currency'
import { DEFAULT_LOCALE } from 'constants/locale'

const defaultCurrencyFormatterOptions: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: DEFAULT_FIAT_CURRENCY,
  currencyDisplay: 'code',
}

export function formatFiatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions,
  locale = DEFAULT_LOCALE
) {
  const opts = Object.assign({}, defaultCurrencyFormatterOptions, options)
  const formatter = new Intl.NumberFormat(locale, opts)
  return formatter.format(amount)
}
