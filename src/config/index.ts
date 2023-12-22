import { EnvironmentType } from '@verida/types'
import {
  Blockchain,
  CredentialStatusType,
  DidMethod,
  NetworkId,
} from 'features/polygonid/constants'
import { cloneDeep, isEmpty, isEqual, merge } from 'lodash'
import Config from 'react-native-config'

import { APP_PACKAGE, APP_VERSION_WITH_BUILD } from 'constants/application'

import { EnvVarsSchema } from './schema'

// Validate the environment variables with the Zod schema
const envVarsCheckResult = EnvVarsSchema.safeParse(Config)
if (envVarsCheckResult.success === false) {
  // eslint-disable-next-line no-console
  console.error('Environment Variables Errors', envVarsCheckResult.error)
  throw new Error('Environment Variables Errors')
}
const { data: envVars } = envVarsCheckResult

export const config = {
  logLevel: envVars.LOG_LEVEL,
  dev: {
    devMode: __DEV__,
    disableLogBox: envVars.DISABLE_LOG_BOX,
    enableClipboardInQrCodeScanner: envVars.ENABLE_CLIPBOARD_IN_QR_CODE_SCANNER,
  },
  sentry: {
    enabled: envVars.ENABLE_SENTRY,
    dsn: envVars.SENTRY_DSN,
    environment: envVars.SENTRY_ENVIRONMENT,
    release: `${APP_PACKAGE}@${APP_VERSION_WITH_BUILD}`,
    // tracesSampleRate: Number(envVars.SENTRY_TRACE_SAMPLE_RATE || 0.1),
    // replaysSessionSampleRate: Number(
    //   envVars.SENTRY_REPLAY_SESSION_SAMPLE_RATE || 0.1
    // ),
    // replaysOnErrorSampleRate: Number(
    //   envVars.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || 1.0
    // ),
  },
  features: {
    veridaMainnet: {
      enabled: true,
      enableMigration: true,
    },
    home: {
      hideCryptoWalletOverview: false,
      hidePromoBanners: false,
      hideGettingStarted: false,
    },
  },
  verida: {
    [EnvironmentType.LOCAL]: {
      // The local configuration use the same env var as devnet. When locally developping, the env var can be set to point the local Verida Network rather than the devnet
      rpcUrl: envVars.VERIDA_DEVNET_RPC_URL,
      notificationServerUrls: [envVars.VERIDA_DEVNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: envVars.VERIDA_DEVNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        envVars.VERIDA_DEVNET_META_TRANSACTION_SERVER_URL,
    },
    [EnvironmentType.DEVNET]: {
      rpcUrl: envVars.VERIDA_DEVNET_RPC_URL,
      notificationServerUrls: [envVars.VERIDA_DEVNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: envVars.VERIDA_DEVNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        envVars.VERIDA_DEVNET_META_TRANSACTION_SERVER_URL,
    },
    [EnvironmentType.TESTNET]: {
      rpcUrl: envVars.VERIDA_TESTNET_RPC_URL,
      notificationServerUrls: [envVars.VERIDA_TESTNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: envVars.VERIDA_TESTNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        envVars.VERIDA_TESTNET_META_TRANSACTION_SERVER_URL,
    },
    [EnvironmentType.MAINNET]: {
      rpcUrl: envVars.VERIDA_MAINNET_RPC_URL,
      notificationServerUrls: [envVars.VERIDA_MAINNET_NOTIFICATION_SERVER_URL],
      dataConnectorServerUrl: envVars.VERIDA_MAINNET_DATA_CONNECTOR_URL,
      metaTransactionServerUrl:
        envVars.VERIDA_MAINNET_META_TRANSACTION_SERVER_URL,
    },
  },
  walletProvider: {
    url: envVars.VERIDA_WALLET_PROVIDER_URL,
  },
  dataConnector: {
    retyInterval: 5000,
    retryLimit: 10,
  },
  blockchain: {
    infuraApiKey: envVars.INFURA_API_KEY,
  },
  walletConnect: {
    projectId: envVars.WALLETCONNECT_PROJECT_ID,
    relayUrl: envVars.WALLETCONNECT_RELAY_URL,
  },
  polygonId: {
    common: {
      blockchain: Blockchain.Polygon,
      didMethod: DidMethod.PolygonId,
      revocationType: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      ipfsGatewayUrl: envVars.IPFS_GATEWAY_URL,
    },
    testnet: {
      networkId: NetworkId.Mumbai,
      revocationBaseUrl: envVars.POLYGON_ID_REVOCATION_BASE_URL,
      rpcUrl: envVars.POLYGON_ID_TESTNET_RPC_URL,
      contractAddress: '0x134B1BE34911E39A8397ec6289782989729807a4',
    },
    mainnet: {
      networkId: NetworkId.Main,
      revocationBaseUrl: envVars.POLYGON_ID_REVOCATION_BASE_URL,
      rpcUrl: envVars.POLYGON_ID_MAINNET_RPC_URL,
      contractAddress: '0x624ce98D2d27b20b8f8d521723Df8fC4db71D79D',
    },
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
