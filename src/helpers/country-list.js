import { getNames } from 'country-list'

const list = getNames()

export const COUNTRIES = list
  .sort((a, b) => a > b)
  .map((item) => ({ label: item, value: item }))
