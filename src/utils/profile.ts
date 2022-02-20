import { countries } from 'countries-list'
import { get } from 'lodash'

import AccountManager from 'api/AccountManager'

export async function getUserCountryCode() {
  if (!AccountManager.getInstance().getSelectedAccount()) {
    return null
  }
  const vault = AccountManager.getInstance().vault as any
  const publicData = await vault.profiles.public.getMany()
  const userCountry = get<string>(publicData, 'country')

  return getCountryCode(userCountry)
}

export function getCountryCode(countryName: string) {
  let countryCode = null
  Object.keys(countries).map((key) => {
    const country = countries[key as keyof typeof countries]
    if (country.name === countryName) {
      countryCode = key
    }
  })

  return countryCode
}
