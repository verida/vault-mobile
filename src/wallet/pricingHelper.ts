// import { SUPPORTED_TOKENS } from './constants'
import { Token } from './types'

const getPricesForCoins = () => {
  // get prices from CMC API, pass array of addresses from SUPPORTED_TOKENS
}

const getPriceForSingleToken = (token: Token) => {
  // get qoute from CMC API, pass token address
}

export default { getPricesForCoins, getPriceForSingleToken }
