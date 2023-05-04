import { EnvironmentType } from '@verida/types'
import Config from 'react-native-config'

/**
 * TODO: Remove this note
 * Network environment will be set on the .env.type file for each build types
 *
 * NETWORK_ENVIRONMENT: production ? testnet: devnet
 * NETWORK_ENDPOINT_URL: production ? https://meta-tx-server1.tn.verida.tech: https://devnet-meta-tx-server.tn.verida.tech
 */
// eslint-disable-next-line no-console
console.info(
  'Network config',
  JSON.stringify(
    {
      NETWORK_ENVIRONMENT: Config.NETWORK_ENVIRONMENT,
      NETWORK_ENDPOINT_URL: Config.NETWORK_ENDPOINT_URL,
    },
    null,
    2
  )
)
//

export const ENVIRONMENT = Config.NETWORK_ENVIRONMENT

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
    DATA_CONNECTOR_RETRY_INTERVAL: 5000,
    DATA_CONNECTOR_RETRY_LIMIT: 10,
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
        endpointUrl: Config.NETWORK_ENDPOINT_URL,
      },
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    },
  },
  devnet: {
    VERIDA_ENVIRONMENT: EnvironmentType.DEVNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
    DATA_CONNECTOR_URL: 'https://dataconnector.tn.verida.tech',
  },
  testnet: {
    VERIDA_ENVIRONMENT: EnvironmentType.TESTNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
    DATA_CONNECTOR_URL: 'https://dataconnector.tn.verida.tech',
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
