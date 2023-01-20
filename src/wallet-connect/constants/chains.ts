import { IChainData } from '../types'

export const SUPPORTED_CHAINS: IChainData[] = [
  {
    name: 'Ethereum Goerli',
    short_name: 'rin',
    chain: 'ETH',
    network: 'goerli',
    chain_id: 5,
    network_id: 5,
    rpc_url: 'https://goerli.infura.io/v3/%API_KEY%',
    native_currency: {
      symbol: 'ETH',
      name: 'Ether',
      decimals: '18',
      contractAddress: '',
      balance: '',
    },
  },
  // {
  //   name: 'Ethereum Mainnet',
  //   short_name: 'eth',
  //   chain: 'ETH',
  //   network: 'mainnet',
  //   chain_id: 1,
  //   network_id: 1,
  //   rpc_url: 'https://mainnet.infura.io/v3/%API_KEY%',
  //   native_currency: {
  //     symbol: 'ETH',
  //     name: 'Ether',
  //     decimals: '18',
  //     contractAddress: '',
  //     balance: '',
  //   },
  // },
  // {
  //   name: 'Polygon Mainnet',
  //   short_name: 'matic',
  //   chain: 'Matic',
  //   network: 'mainnet',
  //   chain_id: 137,
  //   network_id: 137,
  //   rpc_url: 'https://polygon-mainet.infura.io/v3/%API_KEY%',
  //   native_currency: {
  //     symbol: 'MATIC',
  //     name: 'Matic',
  //     decimals: '18',
  //     contractAddress: '',
  //     balance: '',
  //   },
  // },
]
