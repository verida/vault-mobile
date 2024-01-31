import 'jest'

import { ChainMetadata } from '../../../src/features/blockchain/@types'
import { BalanceByChainResult } from '../../../src/features/cryptoWallet/@types'
import { balanceByChainResultsToErc20AggregateWalletBannerBalance } from '../../../src/features/cryptoWallet/utils/balanceByChainResultsToErc20AggregateWalletBannerBalance'

const BALANCE_BY_CHAIN_RESULTS = [
  {
    amount: 3823.4267281649686,
    asset: {
      assetName: {
        namespace: 'slip44',
        reference: '60',
      },
      chainId: {
        namespace: 'eip155',
        reference: '5',
      },
      tokenId: '1',
    },
    balance: 2.019587499996514,
    change: 1.52902743,
    label: 'ETH',
    price: 1893.1721097360567,
    quantity: 2.019587499996514,
    quote: {
      USD: {
        percent_change_24h: 1.52902743,
        price: 1893.1721097360567,
      },
    },
    symbol: 'ETH',
    token: {
      account: {
        address: '0x12B213B5B4ee35Acb4A06e4ec8A38423Bf92E339',
        chainId: {
          namespace: 'eip155',
          reference: '5',
        },
      },
      asset: {
        assetName: {
          namespace: 'slip44',
          reference: '60',
        },
        chainId: {
          namespace: 'eip155',
          reference: '5',
        },
        tokenId: '1',
      },
      balance: 2.019587499996514,
      chainName: 'ethereum',
      cmcId: 1027,
      cmcRank: 2,
      confirmations: 6,
      decimal: 18,
      derivationPath: "m/44'/60'/0'/0/0",
      explorerURL: 'https://goerli.etherscan.io/',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      isMainnet: false,
      name: 'Ethereum',
      priceAlwaysZero: false,
      quote: {
        USD: {
          percent_change_24h: 1.52902743,
          price: 1893.1721097360567,
        },
      },
      symbol: 'ETH',
    },
  },
  {
    amount: 500.0625908965174,
    asset: {
      assetName: {
        namespace: 'ERC20',
        reference: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
      },
      chainId: {
        namespace: 'eip155',
        reference: '5',
      },
      tokenId: '1',
    },
    balance: 500,
    change: -0.01795587,
    label: 'USDC',
    price: 1.0001251817930348,
    quantity: 500,
    quote: {
      USD: {
        percent_change_24h: -0.01795587,
        price: 1.0001251817930348,
      },
    },
    symbol: 'USDC',
    token: {
      account: {
        address: '0x12B213B5B4ee35Acb4A06e4ec8A38423Bf92E339',
        chainId: {
          namespace: 'eip155',
          reference: '5',
        },
      },
      asset: {
        assetName: {
          namespace: 'ERC20',
          reference: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
        },
        chainId: {
          namespace: 'eip155',
          reference: '5',
        },
        tokenId: '1',
      },
      balance: 500,
      chainName: 'ethereum',
      cmcId: 3408,
      cmcRank: 6,
      confirmations: 6,
      decimal: 6,
      derivationPath: "m/44'/60'/0'/0/0",
      explorerURL: 'https://goerli.etherscan.io/',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
      isMainnet: false,
      name: 'USDC',
      priceAlwaysZero: false,
      quote: {
        USD: {
          percent_change_24h: -0.01795587,
          price: 1.0001251817930348,
        },
      },
      symbol: 'USDC',
      tokenAddress: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    },
  },
  {
    amount: 0,
    asset: {
      assetName: {
        namespace: 'slip44',
        reference: '966',
      },
      chainId: {
        namespace: 'eip155',
        reference: '80001',
      },
      tokenId: '1',
    },
    balance: 0,
    change: 5.17700933,
    label: 'MATIC',
    price: 0.7199404296547429,
    quantity: 0,
    quote: {
      USD: {
        percent_change_24h: 5.17700933,
        price: 0.7199404296547429,
      },
    },
    symbol: 'MATIC',
    token: {
      account: {
        address: '0x12B213B5B4ee35Acb4A06e4ec8A38423Bf92E339',
        chainId: {
          namespace: 'eip155',
          reference: '80001',
        },
      },
      asset: {
        assetName: {
          namespace: 'slip44',
          reference: '966',
        },
        chainId: {
          namespace: 'eip155',
          reference: '80001',
        },
        tokenId: '1',
      },
      balance: 0,
      chainName: 'polygon',
      cmcId: 3890,
      cmcRank: 13,
      confirmations: 4,
      decimal: 18,
      derivationPath: "m/44'/966'/0'/0/0",
      explorerURL: 'https://mumbai.polygonscan.com',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
      isMainnet: false,
      name: 'Polygon',
      priceAlwaysZero: false,
      quote: {
        USD: {
          percent_change_24h: 5.17700933,
          price: 0.7199404296547429,
        },
      },
      symbol: 'MATIC',
    },
  },
] as unknown as readonly BalanceByChainResult[]

const CHAIN_METADATAS = [
  {
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    isMainnet: true,
    name: 'Ethereum',
    namespace: 'eip155',
    nativeCurrencyName: 'ETH',
    reference: '1',
    rpcUrls: ['https://mainnet.infura.io/v3/6e4bf0201647493e93c9eea13b70bd4d'],
    symbol: 'ETH',
  },
  {
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
    isMainnet: true,
    name: 'Polygon',
    namespace: 'eip155',
    nativeCurrencyName: 'MATIC',
    reference: '137',
    rpcUrls: [
      'https://polygon-mainnet.infura.io.infura.io/v3/6e4bf0201647493e93c9eea13b70bd4d',
    ],
    symbol: 'MATIC',
  },
  {
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    isMainnet: false,
    name: 'Ethereum (goerli)',
    namespace: 'eip155',
    nativeCurrencyName: 'ETH',
    reference: '5',
    rpcUrls: ['https://goerli.infura.io/v3/6e4bf0201647493e93c9eea13b70bd4d'],
    symbol: 'ETH',
  },
  {
    decimals: 18,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
    isMainnet: false,
    name: 'Polygon (Mumbai)',
    namespace: 'eip155',
    nativeCurrencyName: 'MATIC',
    reference: '80001',
    rpcUrls: [
      'https://polygon-mumbai.infura.io/v3/6e4bf0201647493e93c9eea13b70bd4d',
    ],
    symbol: 'MATIC',
  },
  {
    decimals: 24,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png',
    isMainnet: false,
    name: 'NEAR (testnet)',
    namespace: 'near',
    nativeCurrencyName: 'NEAR',
    reference: 'testnet',
    rpcUrls: ['https://rpc.testnet.near.org/'],
    symbol: 'NEAR',
  },
] as unknown as readonly ChainMetadata[]

describe('cryptoWallet/utils/balanceByChainResultsToErc20AggregateWalletBannerBalance', () => {
  it('mock', () => {
    expect(
      balanceByChainResultsToErc20AggregateWalletBannerBalance({
        balanceByChainResults: BALANCE_BY_CHAIN_RESULTS,
        chainMetadatas: CHAIN_METADATAS,
      })
    ).toMatchSnapshot()
  })
})
