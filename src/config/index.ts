import { AccountNodeDIDClientConfig, EnvironmentType } from '@verida/types'
import {
  Blockchain,
  CredentialStatusType,
  DidMethod,
  NetworkId,
} from 'features/polygonid/constants'
import { LogLevel } from 'features/telemetry'
import { cloneDeep, isEmpty, isEqual, merge } from 'lodash'
import Config from 'react-native-config'

import {
  APP_PACKAGE,
  APP_VERSION_WITH_BUILD,
  VERIDA_VAULT_CONTEXT_NAME,
  VERIDA_WALLET_USER_AGENT,
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
  dev: {
    devMode: __DEV__,
    disableLogBox: Config.DISABLE_LOG_BOX === 'true',
    enableClipboardInQrCodeScanner:
      Config.ENABLE_CLIPBOARD_IN_QR_CODE_SCANNER === 'true',
  },
  logLevel,
  sentry: {
    enabled: Config.ENABLE_SENTRY === 'true',
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
  dataConnector: {
    retyInterval: 5000,
    retryLimit: 10,
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
      revocationBaseUrl: Config.POLYGON_ID_REVOCATION_BASE_URL,
      rpcUrl: Config.POLYGON_MUMBAI_RPC_URL,
      contractAddress: '0x134B1BE34911E39A8397ec6289782989729807a4',
    },
    mainnet: {
      networkId: NetworkId.Main,
      revocationBaseUrl: Config.POLYGON_ID_REVOCATION_BASE_URL,
      rpcUrl: Config.POLYGON_MAINNET_RPC_URL,
      contractAddress: '0x624ce98D2d27b20b8f8d521723Df8fC4db71D79D',
    },
  },
  // --------------------
  MNEMONIC_LENGTH: 12,
  CONFIG_DB: 'vault-config',
  SEED_PHRASE_BACKED_UP_CONFIG: 'seedPhraseBackedUp',
  DEFAULT_REMOTE_REQUEST_TIMEOUT: 5000,
  // --------------------
  VERIDA_DID_CLIENT_CONFIG: {
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
          'user-agent': VERIDA_WALLET_USER_AGENT,
        },
      },
      endpointUrl: Config.VERIDA_TESTNET_META_TRANSACTION_SERVER_URL,
    },
    rpcUrl: Config.POLYGON_MUMBAI_RPC_URL,
  } as AccountNodeDIDClientConfig,
  NETWORK_ENDPOINT_URL: Config.VERIDA_TESTNET_META_TRANSACTION_SERVER_URL, // TODO: This should eventually disappear when the Wallet will have to support all the networks (devnet, testnet, mainnet altogether)
  // --------------------
  INFURA_API_KEY: Config.INFURA_API_KEY, // TODO: Move to specific network config, but will need to be for multiple networks
  walletConnect: {
    projectId: Config.WALLETCONNECT_PROJECT_ID,
    relayUrl: Config.WALLETCONNECT_RELAY_URL,
  },
}

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
// TODO: VERIDA_WALLET_PROVIDER_URL is a single env var but we'll need to figure out how to support multiple networks. Wallet Provider should not be related to the Verida Network, so a single env var should be enough.
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
    WALLET_PROVIDER_URL: Config.VERIDA_WALLET_PROVIDER_URL,
  },
  [EnvironmentType.TESTNET]: {
    VERIDA_ENVIRONMENT: EnvironmentType.TESTNET,
    WALLET_PROVIDER_CHAINS: EnvironmentType.TESTNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
    DATA_CONNECTOR_URL: 'https://dataconnector.tn.verida.tech',
    WALLET_PROVIDER_URL: Config.VERIDA_WALLET_PROVIDER_URL,
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

/*
 * Merge local app-config with remote-config
 *
 * @param remoteConfig
 * @returns
 */
export function mergeWithRemoteConfig(
  remoteConfig: Partial<typeof RESOLVED_CONFIG>
) {
  if (isEmpty(remoteConfig)) return false

  const originalConfig = cloneDeep(config)
  // Mutate config
  merge(config, remoteConfig)

  return !isEqual(config, originalConfig)
}
