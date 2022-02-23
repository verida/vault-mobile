export const SUPPORTED_TOKENS = [
  {
    name: 'Algorand',
    symbol: 'ALGO',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:slip44/1',
    decimal: 6,
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:10458941/1',
    decimal: 6,
  },
  {
    name: 'PlanetWatch',
    symbol: 'PLANETS',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11861.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:408947/1',
    decimal: 6,
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    address: 'eip155:1/erc20:0x0000001/1',
    decimal: 18,
  },
  {
    name: 'DAI Coin',
    symbol: 'DAI',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png',
    address: 'eip155:4/erc20:0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735/1',
    decimal: 18,
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    address: 'eip155:4/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/1',
    decimal: 18,
  },
]

export const SUPPORTED_TOKENS_SYMBOLS = SUPPORTED_TOKENS.map(
  (value) => value.symbol
).join(',')
