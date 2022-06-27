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

export const moralisApi = create({
  baseURL: 'https://deep-index.moralis.io/api/v2/',
  headers: {
    'X-API-Key':
      '4M9sy1EVrR2iS5vvsbm3MaCdigJwP7Q9HCkKRphYqGzT0hR6vw1LbBcb0z7hQ9Fs',
  },
})

export const nearIndexerApi = create({
  baseURL: 'http://3.15.157.193:3000/',
})

export const walletProviderApi = create({
  baseURL: 'https://walletprovider.tn.verida.tech/',
})
