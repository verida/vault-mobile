import { DEFAULT_LOCALE } from 'constants/locale'

export function formatPercentage(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = DEFAULT_LOCALE
) {
  const opts = Object.assign(
    {},
    {
      style: 'percent',
    },
    options
  )
  const formatter = new Intl.NumberFormat(locale, opts)
  return formatter.format(value)
}
