import { DEFAULT_LOCALE } from 'constants/locale'

const DEFAULT_NUMBER_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

const DEFAULT_PERCENTAGE_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

export function formatNumber(
  value: number,
  unit?: string,
  options?: Intl.NumberFormatOptions,
  locale = DEFAULT_LOCALE
) {
  const opts = Object.assign({}, DEFAULT_NUMBER_FORMAT_OPTIONS, options)
  const formatter = new Intl.NumberFormat(locale, opts)
  return `${formatter.format(value)}${unit ? ` ${unit}` : ''}`
}

export function formatNumberPercentage(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = DEFAULT_LOCALE
) {
  const opts = Object.assign({}, DEFAULT_PERCENTAGE_FORMAT_OPTIONS, options)
  const formatter = new Intl.NumberFormat(locale, opts)
  return formatter.format(value)
}

/**
 * Return the number of zeros in the decimals of the value.
 *
 * For instance 1.0009 will return 3, 1.9 will return 0
 *
 * @param value
 * @returns The number of zeros in the decimals of the number
 */
export function getNbZerosInDecimals(value: number) {
  return -Math.floor(Math.log10(value) + 1)
}

/**
 * Return the number of significant decimals (zeros) of a number, with optional min, max and offset.
 *
 * @param value The value to get the number of decimals from
 * @param min The minimum number of decimals
 * @param max The maximum number of decimals
 * @param offset The offset to add to the number of decimals
 * @returns The number of significant decimals
 */
export function getSignificantDecimals(
  value: number,
  min = 0,
  max = 6,
  offset = 2
) {
  const nbZero = getNbZerosInDecimals(value)
  return Math.min(Math.max(nbZero + offset, min), max)
}

/**
 * Return the number of significant decimals (zeros) for a value based on aprice, assuming 0.01 is lowest significant value.
 *
 * @param price
 * @param min
 * @param max
 * @param offset
 * @returns
 */
export function getSignificantDecimalsFromPrice(
  price: number,
  min = 0,
  max = 6,
  offset = 2
) {
  const value = price === 0 ? 1 : 0.01 / price
  return getSignificantDecimals(value, min, max, offset)
}
