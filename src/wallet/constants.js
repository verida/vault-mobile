export const SUPPORTED_TOKENS = [
  {
    name: 'Algorand',
    symbol: 'ALGO',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:slip44/1',
  },
  {
    name: 'PlanetWatch',
    symbol: 'PLANETS',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11861.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:27165954/1',
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:31566704/1',
  },
  {
    name: 'Cipher',
    symbol: 'CPR',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4589.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:125584116/1',
  },
  {
    name: 'Opulous',
    symbol: 'OPUL',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/10409.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:287867876/1',
  },
  {
    name: 'WaveCoin',
    symbol: 'WAVE',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/13904.png',
    address:
      'algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=/erc20:187215017/1',
  },
]

export const SUPPORTED_TOKENS_SYMBOLS = SUPPORTED_TOKENS.map(
  (value) => value.symbol
).join(',')
