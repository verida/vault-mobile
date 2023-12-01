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
  verida: {
    // Not used yet
    [EnvironmentType.LOCAL]: {
      // The local configuration use the same env var as devnet. When locally developping, the env var can be set to point the local Verida Network rather than the devnet
      rpcUrl: Config.VERIDA_DEVNET_RPC_URL,
      notificationServerUrls: [Config.VERIDA_DEVNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: Config.VERIDA_DEVNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        Config.VERIDA_DEVNET_META_TRANSACTION_SERVER_URL,
    },
    [EnvironmentType.DEVNET]: {
      rpcUrl: Config.VERIDA_DEVNET_RPC_URL,
      notificationServerUrls: [Config.VERIDA_DEVNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: Config.VERIDA_DEVNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        Config.VERIDA_DEVNET_META_TRANSACTION_SERVER_URL,
    },
    [EnvironmentType.TESTNET]: {
      rpcUrl: Config.VERIDA_TESTNET_RPC_URL,
      notificationServerUrls: [Config.VERIDA_TESTNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: Config.VERIDA_TESTNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        Config.VERIDA_TESTNET_META_TRANSACTION_SERVER_URL,
    },
    [EnvironmentType.MAINNET]: {
      rpcUrl: Config.VERIDA_MAINNET_RPC_URL,
      notificationServerUrls: [Config.VERIDA_MAINNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: Config.VERIDA_MAINNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        Config.VERIDA_MAINNET_META_TRANSACTION_SERVER_URL,
    },
  },
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
  walletProvider: {
    url: Config.VERIDA_WALLET_PROVIDER_URL,
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
  blockchain: {
    infuraApiKey: Config.INFURA_API_KEY,
  },
  walletConnect: {
    projectId: Config.WALLETCONNECT_PROJECT_ID,
    relayUrl: Config.WALLETCONNECT_RELAY_URL,
  },
}

type VeridaEnvironmentConfig<T extends EnvironmentType> = {
  VERIDA_ENVIRONMENT: T // TODO: Find a better name, it's not en environment, it's a network!
  NOTIFICATION_ENDPOINTS: readonly string[]

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
  },
  [EnvironmentType.TESTNET]: {
    VERIDA_ENVIRONMENT: EnvironmentType.TESTNET,
    WALLET_PROVIDER_CHAINS: EnvironmentType.TESTNET,
    NOTIFICATION_ENDPOINTS: ['https://notifications.acacia.verida.tech/'],
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
