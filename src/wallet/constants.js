export const SUPPORTED_TOKENS = [
  {
    name: 'Algorand',
    symbol: 'ALGO',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png',
    address: 'eip155:1/slip44:60',
  },
  {
    name: 'OEC Token',
    symbol: 'OKT',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8267.png',
    address: 'eip155:1/slip44:60',
  },
  {
    name: 'PlanetWatch',
    symbol: 'PLANETS',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11861.png',
    address: 'eip155:1/slip44:60',
  },
  {
    name: 'KuCoin Token',
    symbol: 'KCS',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2087.png',
    address: 'eip155:1/slip44:60',
  },
]

export const SUPPORTED_TOKENS_SYMBOLS = SUPPORTED_TOKENS.map(
  (value) => value.symbol
).join(',')
