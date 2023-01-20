import { countries } from 'countries-list'

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
