import { create } from 'apisauce'

export const pricingApi = create({
  baseURL: 'https://pro-api.coinmarketcap.com/v1/',
  headers: {
    'X-CMC_PRO_API_KEY': '2b582ec0-d3ca-412b-be69-782059593383',
  },
})
