import { create } from 'apisauce'

export const pricingApi = create({
  baseURL: 'https://pro-api.coinmarketcap.com/v1/',
  headers: {
    'X-CMC_PRO_API_KEY': '2b582ec0-d3ca-412b-be69-782059593383',
  },
})

export const chainsApi = create({
  baseURL: 'https://ubiquity.api.blockdaemon.com/',
  headers: {
    Authorization: 'Bearer bd1b7W47JQiwxh2gxxcrpz8e4I97dpJVrmirQNq1dWPB9KM',
  },
})
