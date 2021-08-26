import { countries } from 'countries-list'

export const COUNTRIES = Object.values(countries)
  .sort((a, b) => a.name > b.name)
  .map((item) => ({ label: item.name, value: item.name, flag: item.emoji }))
