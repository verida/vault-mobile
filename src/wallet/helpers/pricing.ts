// import { SUPPORTED_TOKENS } from './constants'
import { AssetType } from 'caip'

const getPricesForTokens = () => {
  // get prices from CMC API, pass array of addresses from SUPPORTED_TOKENS
}

const getPriceForSingleToken = (token: AssetType.AssetTypeParams): number => {
  // get qoute from CMC API, pass token address
}

export default { getPricesForTokens, getPriceForSingleToken }
