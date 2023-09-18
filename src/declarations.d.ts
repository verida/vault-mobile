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
    VERIDA_NETWORK_ENVIRONMENT:  'local' | 'devnet' | 'testnet' | 'mainnet'
    VERIDA_META_TRANSACTION_SERVER: string
    VERIDA_IPFS_GATEWAY_URL: string

    INFURA_API_KEY: string
    POLYGON_MUMBAI_RPC_URL: string
    POLYGON_MUMBAI_VERIDA_CONTRACT_ADDRESS: string
    POLYGON_MAINNET_RPC_URL: string
    POLYGON_MAINNET_VERIDA_CONTRACT_ADDRESS: string
    IPFS_GATEWAY_URL: string

    WALLETCONNECT_PROJECT_ID: string
    WALLETCONNECT_RELAY_URL: string
    
    CODE_PUSH_DEPLOYMENT_KEY_ANDROID?: string
    CODE_PUSH_DEPLOYMENT_KEY_IOS?: string
    
    LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug'
    SENTRY_ENABLED: 'true' | 'false'
    SENTRY_ENVIRONMENT?: 'local' | undefined
    SENTRY_DSN: string

    LOG_BOX_ENABLED?: 'true' | 'false'
    USE_QR_CODE_FROM_CLIPBOARD?: 'true' | 'false'
  }
  
  export const Config: NativeConfig
  export default Config
}