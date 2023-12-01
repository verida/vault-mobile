import { EnvironmentType } from '@verida/types'
import {
  Blockchain,
  CredentialStatusType,
  DidMethod,
  NetworkId,
} from 'features/polygonid/constants'
import { LogLevel } from 'features/telemetry'
import { cloneDeep, isEmpty, isEqual, merge } from 'lodash'
import Config from 'react-native-config'

import { APP_PACKAGE, APP_VERSION_WITH_BUILD } from 'constants/application'

const logLevel: LogLevel =
  Config.LOG_LEVEL === 'error'
    ? 'error'
    : Config.LOG_LEVEL === 'warn'
    ? 'warn'
    : Config.LOG_LEVEL === 'debug'
    ? 'debug'
    : 'info'

export const config = {
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

/*
 * Merge local app-config with remote-config
 *
 * @param remoteConfig
 * @returns
 */
export function mergeWithRemoteConfig(remoteConfig: Partial<typeof config>) {
  if (isEmpty(remoteConfig)) return false

  const originalConfig = cloneDeep(config)
  // Mutate config
  merge(config, remoteConfig)

  return !isEqual(config, originalConfig)
}
