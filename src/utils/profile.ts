import { countries } from 'countries-list'
import { get } from 'lodash'

import AccountManager from 'api/AccountManager'

export async function getUserCountryCode() {
  const vault = AccountManager.getInstance().vault as any
  const publicData = await vault.profiles.public.getMany()
  const userCountry = get(publicData, 'country')
  let countryCode = null
  Object.keys(countries).map((key) => {
    const country = countries[key as keyof typeof countries]
    if (country.name === userCountry) {
      countryCode = key
    }
  })

  return countryCode
}
