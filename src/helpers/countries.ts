import { countries } from 'countries-list'

export const COUNTRIES = Object.values(countries)
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((item) => ({ label: item.name, value: item.name, flag: item.emoji }))

export type CountrySelectItem = (typeof COUNTRIES)[0]

/**
 * Get country code from country name
 * @param countryName Country full name. Ex: "Australia"
 */
export function getCountryCode(countryName: string): string {
  let countryCode = 'US'
  Object.keys(countries).map((key) => {
    const country = countries[key as keyof typeof countries]
    if (country.name === countryName) {
      countryCode = key
    }
  })

  return countryCode
}
