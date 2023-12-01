declare module '*.svg' {
  import React from 'react'
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<
    SvgProps & {
      fill?: string
      fillSecondary?: string
    }
  >
  export default content
}

declare module 'react-native-config' {
  export interface NativeConfig {
    VERIDA_NETWORK_ENVIRONMENT?: 'local' | 'devnet' | 'testnet' | 'mainnet'

    VERIDA_DEVNET_RPC_URL: string
    VERIDA_DEVNET_NOTIFICATION_SERVER_URL: string
    VERIDA_DEVNET_DATA_CONNECTOR_URL: string
    VERIDA_DEVNET_META_TRANSACTION_SERVER_URL: string
    VERIDA_TESTNET_RPC_URL: string
    VERIDA_TESTNET_NOTIFICATION_SERVER_URL: string
    VERIDA_TESTNET_DATA_CONNECTOR_URL: string
    VERIDA_TESTNET_META_TRANSACTION_SERVER_URL: string
    VERIDA_MAINNET_RPC_URL: string
    VERIDA_MAINNET_NOTIFICATION_SERVER_URL: string
    VERIDA_MAINNET_DATA_CONNECTOR_URL: string
    VERIDA_MAINNET_META_TRANSACTION_SERVER_URL: string

    VERIDA_WALLET_PROVIDER_URL: string

    POLYGON_MUMBAI_RPC_URL: string
    POLYGON_MAINNET_RPC_URL: string
    INFURA_API_KEY: string
    IPFS_GATEWAY_URL?: string

    POLYGON_ID_REVOCATION_BASE_URL: string

    WALLETCONNECT_PROJECT_ID: string
    WALLETCONNECT_RELAY_URL: string

    CODE_PUSH_DEPLOYMENT_KEY_ANDROID: string
    CODE_PUSH_DEPLOYMENT_KEY_IOS: string

    LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug'
    ENABLE_SENTRY?: 'true' | 'false'
    SENTRY_DSN?: string
    SENTRY_ENVIRONMENT?: 'local'

    DISABLE_LOG_BOX?: 'true' | 'false'
    ENABLE_CLIPBOARD_IN_QR_CODE_SCANNER?: 'true' | 'false'
  }

  export const Config: NativeConfig
  export default Config
}
