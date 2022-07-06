declare module '*.svg' {
  const content: any
  export default content
}


declare module "react-native-config" {
  interface Env {
    INFURA_API_KEY: string
    SENTRY_ENVIRONMENT: string
    BITRISE_TRIGGERED_WORKFLOW_TITLE: string
  }
  const BuildConfig: Env
  export default BuildConfig
}