export const SUPPORTED_TOKENS = [
  {
    name: 'Algorand',
    symbol: 'ALGO',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png',
    address: 'algo/slip44:60',
  },
  {
    name: 'PlanetWatch',
    symbol: 'PLANETS',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11861.png',
    address: '27165954',
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    address: '31566704',
  },
  {
    name: 'Cipher',
    symbol: 'CPR',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4589.png',
    address: '125584116',
  },
  {
    name: 'Opulous',
    symbol: 'OPUL',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/10409.png',
    address: '287867876',
  },
  {
    name: 'WaveCoin',
    symbol: 'WAVE',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/13904.png',
    address: '187215017',
  },
]

export const SUPPORTED_TOKENS_SYMBOLS = SUPPORTED_TOKENS.map(
  (value) => value.symbol
).join(',')
