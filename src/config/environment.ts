import { EnvironmentType } from '@verida/types'
import {
  Blockchain,
  CredentialStatusType,
  DidMethod,
  NetworkId,
} from 'features/polygonid/constants'
import { LogLevel } from 'features/telemetry'
import Config from 'react-native-config'

import {
  APP_PACKAGE,
  APP_VERSION_WITH_BUILD,
  VERIDA_VAULT_CONTEXT_NAME,
} from 'constants/application'

const logLevel: LogLevel =
  Config.LOG_LEVEL === 'error'
    ? 'error'
    : Config.LOG_LEVEL === 'warn'
    ? 'warn'
    : Config.LOG_LEVEL === 'debug'
    ? 'debug'
    : 'info'

// TODO: This should eventually disappear when the Wallet will have to support all the networks (devnet, testnet, mainnet altogether).
const veridaNetwork: EnvironmentType =
  Config.VERIDA_NETWORK_ENVIRONMENT === EnvironmentType.MAINNET
    ? EnvironmentType.MAINNET
    : Config.VERIDA_NETWORK_ENVIRONMENT === EnvironmentType.DEVNET
    ? EnvironmentType.DEVNET
    : Config.VERIDA_NETWORK_ENVIRONMENT === EnvironmentType.LOCAL
    ? EnvironmentType.LOCAL
    : EnvironmentType.TESTNET

// TODO: Look at making this configuration, or part of it, updatable remotely

// TODO: Clean up the configuration, group in sub-object when relevant (for instance sentry), remove unnecessary properties, etc.
const COMMON_CONFIG = {
  // --------------------
  devMode: __DEV__,
  logLevel,
  // --------------------
  sentry: {
    enabled: Config.SENTRY_ENABLED === 'true',
    dsn: Config.SENTRY_DSN,
    environment: Config.SENTRY_ENVIRONMENT || 'local',
    release: `${APP_PACKAGE}@${APP_VERSION_WITH_BUILD}`,
    // tracesSampleRate: Number(Config.SENTRY_TRACE_SAMPLE_RATE || 0.1),
    // replaysSessionSampleRate: Number(
    //   Config.SENTRY_REPLAY_SESSION_SAMPLE_RATE || 0.1
    // ),
    // replaysOnErrorSampleRate: Number(
    //   Config.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || 1.0
    // ),
  },
  polygonId: {
    common: {
      blockchain: Blockchain.Polygon,
      didMethod: DidMethod.PolygonId,
      revocationType: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      ipfsGatewayUrl: Config.IPFS_GATEWAY_URL,
    },
    testnet: {
      networkId: NetworkId.Mumbai,
      revocationBaseUrl: 'https://rhs-staging.polygonid.me/', // TODO: Make it an environment variable
      rpcUrl: Config.POLYGON_MUMBAI_RPC_URL,
      contractAddress: Config.POLYGON_MUMBAI_VERIDA_CONTRACT_ADDRESS,
    },
    mainnet: {
      networkId: NetworkId.Main,
      revocationBaseUrl: 'https://rhs-staging.polygonid.me/', // TODO: Make it an environment variable
      rpcUrl: Config.POLYGON_MAINNET_RPC_URL,
      contractAddress: Config.POLYGON_MAINNET_VERIDA_CONTRACT_ADDRESS,
    },
  },
  // --------------------
  ACCOUNTS_STORAGE_KEY: 'accounts',
  SELECTED_ACCOUNT_DID_STORAGE_KEY: 'selected-account-did',
  WALLETS_STORAGE_KEY: 'wallets-v4',
  SELECTED_WALLET_STORAGE_KEY: 'selected-wallet',
  // --------------------
  VERIDA_CONTEXT_NAME: VERIDA_VAULT_CONTEXT_NAME,
  // --------------------
  MNEMONIC_LENGTH: 12,
  CONFIG_DB: 'vault-config',
  SEED_PHRASE_BACKED_UP_CONFIG: 'seedPhraseBackedUp',
  DEFAULT_REMOTE_REQUEST_TIMEOUT: 5000,
  // --------------------
  DATA_CONNECTOR_RETRY_INTERVAL: 5000,
  DATA_CONNECTOR_RETRY_LIMIT: 10,
  // --------------------
  VERIDA_DID_CLIENT_CONFIG: {
    // TODO: As it's passed straight into some SDK functions, this should be strongly typed here
    // TODO: This will have to be specific per network, as the RPC and network endpoint will be different per network
    callType: 'gasless',
    web3Config: {
      callType: 'gasless',
      rpcUrl: Config.POLYGON_MUMBAI_RPC_URL,
      serverConfig: {
        headers: {
          'context-name': VERIDA_VAULT_CONTEXT_NAME,
        },
      },
      postConfig: {
        headers: {
          'user-agent': 'Verida-Vault', // TODO: Move to a constant, don't know what to call it though
        },
      },
      endpointUrl: Config.VERIDA_META_TRANSACTION_SERVER,
    },
    rpcUrl: Config.POLYGON_MUMBAI_RPC_URL,
  },
  NETWORK_ENDPOINT_URL: Config.VERIDA_META_TRANSACTION_SERVER, // TODO: This should eventually disappear when the Wallet will have to support all the networks (devnet, testnet, mainnet altogether)
  // --------------------
  INFURA_API_KEY: Config.INFURA_API_KEY, // TODO: Move to specific network config, but will need to be for multiple networks
  // --------------------
  // TODO: Group WalletConnect config in its own sub property walletConnect: {projectId: '...', relayUrl: '...'}
  WALLETCONNECT_PROJECT_ID: Config.WALLETCONNECT_PROJECT_ID,
  WALLETCONNECT_RELAY_URL: Config.WALLETCONNECT_RELAY_URL,
} as const

type VeridaEnvironmentConfig<T extends EnvironmentType> = {
  VERIDA_ENVIRONMENT: T // TODO: Find a better name, it's not en environment, it's a network!
  NOTIFICATION_ENDPOINTS: readonly string[]
  DATA_CONNECTOR_URL: string
  WALLET_PROVIDER_URL: string

  // TODO: WALLET_PROVIDER_CHAINS should probably have an EnvironmentType of T,
  //       however DEVNET currently relies on TESTNET
  // EDIT: Wallet Provider shouldn't care about the Verida network, as it's focused on the crypto addresses, which btw, should pass the full addresses with the chain namespace and reference, so Wallet Provider knowns enough
  WALLET_PROVIDER_CHAINS: EnvironmentType
}

// TODO: All the specific configs will eventually need to be available through the config when the Wallet will have to support all the network types altogether.
const SPECIFIC_CONFIGS: {
  readonly [key in EnvironmentType]: Partial<
    typeof COMMON_CONFIG & VeridaEnvironmentConfig<key>
  >
} = {
  [EnvironmentType.LOCAL]: {},
  [EnvironmentType.DEVNET]: {
    VERIDA_ENVIRONMENT: EnvironmentType.DEVNET,
    WALLET_PROVIDER_CHAINS: EnvironmentType.TESTNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
    DATA_CONNECTOR_URL: 'https://dataconnector.tn.verida.tech',
    WALLET_PROVIDER_URL: 'https://devnet-walletprovider.tn.verida.tech',
    NETWORK_ENDPOINT_URL: Config.VERIDA_META_TRANSACTION_SERVER,
  },
  [EnvironmentType.TESTNET]: {
    VERIDA_ENVIRONMENT: EnvironmentType.TESTNET,
    WALLET_PROVIDER_CHAINS: EnvironmentType.TESTNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
    DATA_CONNECTOR_URL: 'https://dataconnector.tn.verida.tech',
    WALLET_PROVIDER_URL: 'https://testnet-walletprovider.tn.verida.tech',
    NETWORK_ENDPOINT_URL: Config.VERIDA_META_TRANSACTION_SERVER,
  },
  [EnvironmentType.MAINNET]: {},
}

// TODO: When supporting all the networks together, this won't bee needed anymore
const RESOLVED_CONFIG = Object.assign(
  {},
  COMMON_CONFIG,
  SPECIFIC_CONFIGS[veridaNetwork]
)

export const config = RESOLVED_CONFIG as Required<typeof RESOLVED_CONFIG>

// TODO: Eventually get rid of default export
export default RESOLVED_CONFIG as Required<typeof RESOLVED_CONFIG>
