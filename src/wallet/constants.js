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
    address: 'eip155:1/erc20:slip44/1',
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
    name: 'ChainLink',
    symbol: 'LINK',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
    address: 'eip155:4/erc20:0x01BE23585060835E02B77ef475b0Cc51aA1e0709/1',
    decimal: 18,
  },
  {
    name: 'NEAR Protocol',
    symbol: 'NEAR',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png',
    address: 'near:testnet/erc20:slip44/1',
    decimal: 24,
  },
  {
    name: 'Pulse Token',
    symbol: 'PULSE',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12728.png',
    address: 'near:testnet/nep141:pulse.fakes.testnet/1',
    decimal: 18,
  },
]

export const SUPPORTED_TOKENS_SYMBOLS = SUPPORTED_TOKENS.map(
  (value) => value.symbol
).join(',')

export const NEAR_GAS_AMOUNT_TRANSFER = 223182562500 * 2

export const NEAR_GAS_AMOUNT_FUNGIBLE_TRANSFER = 2428102110654 + 5430000000000
