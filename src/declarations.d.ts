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
  interface Env {
    CODE_PUSH_DEPLOYMENT_KEY_ANDROID?: string
    CODE_PUSH_DEPLOYMENT_KEY_IOS?: string
    DEPLOY_ENVIRONMENT: string
    BITRISE_TRIGGERED_WORKFLOW_TITLE: string
    NETWORK_ENVIRONMENT?: string
    NETWORK_ENDPOINT_URL: string
    INFURA_API_KEY: string
    LOG_LEVEL?: string
    SENTRY_ENVIRONMENT: string
  }
  const BuildConfig: Env
  export default BuildConfig
}
