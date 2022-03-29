import { countries } from 'countries-list'
import { get } from 'lodash'

import AccountManager from 'api/AccountManager'
import { NetworkCountry } from 'api/types'

/**
 * Get country code from user's country name. Ex: Australia => AU
 */
export async function getUserCountryCode() {
  if (!AccountManager.getInstance().getSelectedAccount()) {
    return null
  }
  const vault = AccountManager.getInstance().vault as any
  const publicData = await vault.profiles.public.getMany()
  const userCountry = get<string>(publicData, 'country')

  return getCountryCode(userCountry)
}

/**
 * Get country code from country name
 * @param countryName Country full name. Ex: "Australia"
 */
export function getCountryCode(countryName: string): string | null {
  let countryCode = null
  Object.keys(countries).map((key) => {
    const country = countries[key as keyof typeof countries]
    if (country.name === countryName) {
      countryCode = key
    }
  })

  return countryCode
}

/**
 * Get node code based on country code
 * @param countryCode ISO2 code. Ex: AU
 * @param countryNodes List of country codes mapped with each node code
 */
export function getNodeCodeFromCountry(
  countryCode: string,
  countryNodes: NetworkCountry[]
): string | null {
  let result = null
  countryNodes.every((countryNode) => {
    const matchedKey = Object.keys(countryNode).find(
      (key) => key === countryCode
    )
    if (matchedKey) {
      result = countryNode[matchedKey]
      return false
    }
    return true
  })

  return result
}
