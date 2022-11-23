import {RootStackParams, AuthStackParams, DashboardTabParams, MainStackParams} from 'navigation/types'


declare module '*.svg' {
  const content: any
  export default content
}


declare module "react-native-config" {
  interface Env {
    INFURA_API_KEY: string
    SENTRY_ENVIRONMENT: string
    BITRISE_TRIGGERED_WORKFLOW_TITLE: string
    DEPLOY_ENVIRONMENT: string
  }
  const BuildConfig: Env
  export default BuildConfig
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList, AuthStackParams, DashboardTabParams, MainStackParams  {}
  }
}