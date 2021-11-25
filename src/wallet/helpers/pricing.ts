// import { SUPPORTED_TOKENS } from './constants'
import { AssetType } from 'caip'
import { TokenPrice } from '/wallet/types'

const getPricesForTokens = (): TokenPrice[] => {
  // get prices from CMC API, pass array of addresses from SUPPORTED_TOKENS
  return []
}

const getPriceForSingleToken = (token: AssetType.AssetTypeParams): number => {
  // get qoute from CMC API, pass token address
}

export default { getPricesForTokens, getPriceForSingleToken }
