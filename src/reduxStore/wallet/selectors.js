import { SUPPORTED_TOKENS } from 'wallet/constants'

export const getPricing = (state) => state.pricing.data || {}
export const getList = (state) => {
  const pricing = getPricing(state)
  let list = []
  if (pricing) {
    list = SUPPORTED_TOKENS.map((token) => {
      let tokenPrice = pricing[token.symbol]
      return {
        label: token.name,
        symbol: token.symbol,
        icon: token.icon,
        price: tokenPrice ? tokenPrice.quote.USD.price : 0,
        change: tokenPrice ? tokenPrice.quote.USD.percent_change_24h : 0,
        quantity: 2.04,
        amount: 2828.39,
      }
    })
    return list
  } else {
    return list
  }
}
