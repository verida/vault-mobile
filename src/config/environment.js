import { EnvironmentType } from '@verida/client-rn'

export const ENVIRONMENT = 'devnet'

const ENVIRONMENTS = {
  default: {
    ACCOUNTS_STORAGE_KEY: 'accounts',
    SELECTED_ACCOUNT_DID_STORAGE_KEY: 'selected-account-did',
    WALLETS_STORAGE_KEY: 'wallets-v4',
    SELECTED_WALLET_STORAGE_KEY: 'selected-wallet',
    VERIDA_CONTEXT_NAME: 'Verida: Vault',
    MNEMONIC_LENGTH: 12,
    CONFIG_DB: 'vault-config',
    SEED_PHRASE_BACKED_UP_CONFIG: 'seedPhraseBackedUp',
    DEFAULT_REMOTE_REQUEST_TIMEOUT: 5000,
    VERIDA_DID_CLIENT_CONFIG: {
      callType: 'gasless',
      web3Config: {
        callType: 'gasless',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
        serverConfig: {
          headers: {
            'context-name': 'Verida: Vault',
          },
        },
        postConfig: {
          headers: {
            'user-agent': 'Verida-Vault',
          },
        },
        endpointUrl: 'https://meta-tx-server1.tn.verida.tech',
      },
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    },
  },
  devnet: {
    STORAGE_NODES_URI:
      'https://assets.verida.io/registry/storageNodes/devnet.json',
    VERIDA_ENVIRONMENT: EnvironmentType.TESTNET,
    DEFAULT_COUNTRY: 'AU',
    NOTIFICATION_ENDPOINTS: ['https://notifications.testnet.verida.tech/'],
  },
  testnet: {
    STORAGE_NODES_URI:
      'https://assets.verida.io/registry/storageNodes/testnet.json',
    VERIDA_ENVIRONMENT: EnvironmentType.TESTNET,
    DEFAULT_COUNTRY: 'US',
    NOTIFICATION_ENDPOINTS: ['https://notifications.testnet.verida.tech/'],
  },
}

const CONFIG = Object.assign(
  {},
  ENVIRONMENTS.default,
  ENVIRONMENTS[ENVIRONMENT],
  {
    ENVIRONMENT,
  }
)

export default CONFIG
