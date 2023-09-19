import { initSentry, Logger } from 'features/telemetry'

import { config } from 'config/environment'

const logger = new Logger('Initialisation')

/**
 * Global initialisation of the application
 */
export function initApplication() {
  initSentry()
  printConfig()

  // TODO: Add other feature initialisation (notification, ...)
}

function printConfig() {
  logger.debug('===== Configuration =====')
  logger.debug(`Dev mode: ${config.dev.devMode}`)
  logger.debug(` `)
  logger.debug(
    `Sentry: ${
      config.sentry.enabled && config.sentry.dsn ? 'enabled' : 'disabled'
    }`
  )
  logger.debug(` `)
  logger.debug(`Verida Network: ${config.VERIDA_ENVIRONMENT}`)
  logger.debug(`Verida Meta Transaction Server: ${config.NETWORK_ENDPOINT_URL}`)
  logger.debug(`Verida Wallet Provider: ${config.WALLET_PROVIDER_URL}`)
  logger.debug(` `)
  logger.debug(
    `Polygon Mainnet RPC URL: ${
      config.polygonId.mainnet.rpcUrl ? 'set' : 'not set'
    }`
  )
  logger.debug(
    `Polygon Mumbai RPC URL: ${
      config.polygonId.testnet.rpcUrl ? 'set' : 'not set'
    }`
  )
  logger.debug(`Infura API Key: ${config.INFURA_API_KEY ? 'set' : 'not set'}`)
  logger.debug(`IPFS Gateway URL: ${config.polygonId.common.ipfsGatewayUrl}`)
  logger.debug(` `)
  logger.debug(`WalletConnect Relay URL: ${config.WALLETCONNECT_RELAY_URL}`)
  logger.debug(
    `Wallet Project Id: ${config.WALLETCONNECT_PROJECT_ID ? 'set' : 'not set'}`
  )
  // Complete logs of config here if needed
  logger.debug('=========================')
}
