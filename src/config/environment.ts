import { EnvironmentType } from '@verida/types'
import Config from 'react-native-config'

//Config.NETWORK_ENVIRONMENT = 'devnet'
//Config.NETWORK_ENDPOINT_URL = 'https://devnet-meta-tx-server.tn.verida.tech'

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

export const ENVIRONMENT = Config.NETWORK_ENVIRONMENT as EnvironmentType

const DEFAULT_ENVIRONMENT = {
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
      rpcUrl:
        'https://polygon-mumbai.g.alchemy.com/v2/Q4NRuRlwTNyI90dDCgiX_KT_vS_2gpbN',
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
    rpcUrl:
      'https://polygon-mumbai.g.alchemy.com/v2/Q4NRuRlwTNyI90dDCgiX_KT_vS_2gpbN',
  },
  WALLETCONNECT_PROJECT_ID: '1890472fb88366dd4046858b11e705cd',
  WALLETCONNECT_RELAY_URL: 'wss://relay.walletconnect.com',
} as const

type VeridaEnvironmentConfig<T extends EnvironmentType> = {
  VERIDA_ENVIRONMENT: T
  NOTIFICATION_ENDPOINTS: readonly string[]
  DATA_CONNECTOR_URL: string
  WALLET_PROVIDER_URL: string

  // TODO: WALLET_PROVIDER_CHAINS should probably have an EnvironmentType of T,
  //       however DEVNET currently relies on TESTNET
  WALLET_PROVIDER_CHAINS: EnvironmentType
}

const ENVIRONMENTS: {
  readonly [key in EnvironmentType]: Partial<
    typeof DEFAULT_ENVIRONMENT & VeridaEnvironmentConfig<key>
  >
} = {
  [EnvironmentType.LOCAL]: {},
  [EnvironmentType.DEVNET]: {
    VERIDA_ENVIRONMENT: EnvironmentType.DEVNET,
    WALLET_PROVIDER_CHAINS: EnvironmentType.TESTNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
    DATA_CONNECTOR_URL: 'https://dataconnector.tn.verida.tech',
    WALLET_PROVIDER_URL: 'https://devnet-walletprovider.tn.verida.tech',
  },
  [EnvironmentType.TESTNET]: {
    VERIDA_ENVIRONMENT: EnvironmentType.TESTNET,
    WALLET_PROVIDER_CHAINS: EnvironmentType.TESTNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
    DATA_CONNECTOR_URL: 'https://dataconnector.tn.verida.tech',
    WALLET_PROVIDER_URL: 'https://testnet-walletprovider.tn.verida.tech',
  },
  [EnvironmentType.MAINNET]: {},
}

const AGGREGATE_CONFIG = Object.assign(
  {},
  DEFAULT_ENVIRONMENT,
  ENVIRONMENTS[ENVIRONMENT],
  {
    ENVIRONMENT,
  }
)

export default AGGREGATE_CONFIG as Required<typeof AGGREGATE_CONFIG>
