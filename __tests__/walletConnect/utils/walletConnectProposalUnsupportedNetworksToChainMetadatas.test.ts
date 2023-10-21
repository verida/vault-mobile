import 'jest'

import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'

import { fetchChainsList } from '../../../src/features/blockchain/eip155/utils/chainsList'
import { walletConnectProposalUnsupportedNetworksToChainMetadatas } from '../../../src/features/walletConnect/utils/walletConnectProposalUnsupportedNetworksToChainMetadatas'

const EXAMPLE_PROPOSAL = {
  id: 1697290325307305,
  params: {
    expiry: 1697290630,
    id: 1697290325307305,
    optionalNamespaces: {
      eip155: {
        chains: [
          'eip155:1',
          'eip155:5',
          'eip155:11155111',
          'eip155:137',
          'eip155:80001',
          'eip155:42220',
          'eip155:44787',
          'eip155:56',
          'eip155:43114',
          'eip155:42161',
          'eip155:421613',
          'eip155:10',
          'eip155:420',
          'eip155:8453',
        ],
        events: [
          'chainChanged',
          'accountsChanged',
          'message',
          'disconnect',
          'connect',
        ],
        methods: [
          'eth_sendTransaction',
          'personal_sign',
          'eth_signTypedData',
          'eth_signTypedData_v4',
          'eth_sign',
        ],
        rpcMap: {
          '1': 'https://mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '5': 'https://goerli.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '10': 'https://optimism-mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '56': 'https://old-wispy-arrow.bsc.quiknode.pro/f5c060177236065c1058531a0615ab4f7a34a2fd',
          '137':
            'https://polygon-mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '420':
            'https://optimism-goerli.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '8453':
            'https://base-mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '42161':
            'https://arbitrum-mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '42220': 'https://forno.celo.org',
          '43114':
            'https://avalanche-mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '44787': 'https://alfajores-forno.celo-testnet.org',
          '80001':
            'https://polygon-mumbai.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '421613':
            'https://arbitrum-goerli.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
          '11155111':
            'https://sepolia.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
        },
      },
    },
    pairingTopic:
      '52fc2b2ee8f3fc7513f4e3892c6132cc7c2848392392b953e30654e0ec060c90',
    proposer: {
      metadata: {
        description: 'Swap or provide liquidity on the Uniswap Protocol',
        icons: [
          'https://app.uniswap.org/favicon.png',
          'https://app.uniswap.org/images/192x192_App_Icon.png',
          'https://app.uniswap.org/images/512x512_App_Icon.png',
        ],
        name: 'Uniswap Interface',
        url: 'https://app.uniswap.org',
      },
      publicKey:
        '03998b444aef3cc465185023105f1073a45a2a883b83e81bcc31969ce478e162',
    },
    relays: [
      {
        protocol: 'irn',
      },
    ],
    requiredNamespaces: {
      eip155: {
        chains: ['eip155:1'],
        events: ['chainChanged', 'accountsChanged'],
        methods: ['eth_sendTransaction', 'personal_sign'],
        rpcMap: {
          '1': 'https://mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
        },
      },
    },
  },
  verifyContext: {
    verified: {
      origin: 'https://app.uniswap.org',
      validation: 'UNKNOWN',
      verifyUrl: '',
    },
  },
} as Web3WalletTypes.EventArguments['session_proposal']

jest.setTimeout(10 * 1000)

// TODO: make chainsList static for all calls to fetchChainList
let chainsList: Awaited<ReturnType<typeof fetchChainsList>> | undefined

beforeAll(async () => {
  chainsList = await fetchChainsList()

  if (!Array.isArray(chainsList) || !chainsList.length)
    throw new Error(`Was unable to determine chainsList.`)
})

describe('walletConnectProposalUnsupportedNetworksToChainMetadatas', () => {
  it('proposal', () => {
    expect(
      walletConnectProposalUnsupportedNetworksToChainMetadatas({
        chainsList: chainsList!,
        proposal: EXAMPLE_PROPOSAL,
        currentlyUnsupportedChainIds: [new ChainId('eip155:1')],
      })
    ).toMatchSnapshot()
    expect(
      walletConnectProposalUnsupportedNetworksToChainMetadatas({
        chainsList: chainsList!,
        proposal: EXAMPLE_PROPOSAL,
        currentlyUnsupportedChainIds: [new ChainId('eip155:0')],
      })
    ).toMatchSnapshot()
  })
})
