import { getBuildNumber, getVersion } from 'react-native-device-info'

export const APP_NAME = 'Verida Wallet'
export const APP_PACKAGE = `@verida/vault-mobile`
export const APP_VERSION = getVersion()
export const APP_BUILD_NUMBER = getBuildNumber()
export const APP_VERSION_WITH_BUILD = `${APP_VERSION}+${APP_BUILD_NUMBER}` // For Sentry
export const APP_VERSION_FORMATTED = `${APP_VERSION} (${APP_BUILD_NUMBER})` // For the UI
export const VERIDA_VAULT_CONTEXT_NAME = 'Verida: Vault'
export const VERIDA_WALLET_USER_AGENT = 'Verida-Vault'
