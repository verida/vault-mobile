import { countries } from 'countries-list'
import { get } from 'lodash'

import AccountManager from 'api/AccountManager'
import { NetworkCountry } from 'api/types'

export async function getUserCountryCode() {
  if (!AccountManager.getInstance().getSelectedAccount()) {
    return null
  }
  const vault = AccountManager.getInstance().vault as any
  const publicData = await vault.profiles.public.getMany()
  const userCountry = get<string>(publicData, 'country')

  return getCountryCode(userCountry)
}

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

export function getNodeCodeFromCountry(
  countryCode: string,
  countryNodes: NetworkCountry[]
) {
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
