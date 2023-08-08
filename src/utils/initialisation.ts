import { initSentry, Logger } from 'features/telemetry'

import { config } from 'config/environment'

const logger = new Logger('Initialisation')

/**
 * Global initialisation of the application
 */
export function initApplication() {
  initSentry()

  logger.debug('----- Configuration -----')
  logger.debug(`Dev mode: ${config.devMode}`)
  logger.debug(`Verida Network: ${config.VERIDA_ENVIRONMENT}`)
  logger.debug(`Verida Meta Transaction Server: ${config.NETWORK_ENDPOINT_URL}`)
  logger.debug(`Wallet Provider: ${config.WALLET_PROVIDER_URL}`)
  // Complete logs of config here if needed
  logger.debug('-------------------------')

  // TODO: Add other feature initialisation (notification, ...)
}
