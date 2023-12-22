import { config } from 'config'
import { initNotifications } from 'features/notifications'
import { initSentry, Logger } from 'features/telemetry'
import { Text } from 'react-native'

const logger = new Logger('Initialisation')

/**
 * Global initialisation of the application
 */
export function initApplication() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  /* @ts-ignore because defaultProps is hidden and modifying it is a hack*/
  if (!Text.defaultProps) Text.defaultProps = {}
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  /* @ts-ignore because defaultProps is hidden and modifying it is a hack*/
  Text.defaultProps.allowFontScaling = false

  initSentry()
  initNotifications()

  printConfig()
}

function printConfig() {
  logger.debug('====== Configuration ======')
  logger.debug(`Dev mode: ${config.dev.devMode}`)
  logger.debug(` `)
  logger.debug(
    `Sentry: ${
      config.sentry.enabled && config.sentry.dsn ? 'enabled' : 'disabled'
    }`
  )
  logger.debug(` `)
  logger.debug(`Verida Devnet RPC URL: ${config.verida.devnet.rpcUrl}`)
  logger.debug(
    `Verida Devnet Meta Transaction Server: ${config.verida.devnet.metaTransactionServerUrl}`
  )
  logger.debug(
    `Verida Devnet Notification Server: ${config.verida.devnet.notificationServerUrls}`
  )
  logger.debug(
    `Verida Devnet Data Connector Server: ${config.verida.devnet.dataConnectorServerUrl}`
  )
  logger.debug(` `)
  logger.debug(`Verida Testnet RPC URL: ${config.verida.testnet.rpcUrl}`)
  logger.debug(
    `Verida Testnet Meta Transaction Server: ${config.verida.testnet.metaTransactionServerUrl}`
  )
  logger.debug(
    `Verida Testnet Notification Server: ${config.verida.testnet.notificationServerUrls}`
  )
  logger.debug(
    `Verida Testnet Data Connector Server: ${config.verida.testnet.dataConnectorServerUrl}`
  )
  logger.debug(` `)
  logger.debug(`Verida Mainnet RPC URL: ${config.verida.mainnet.rpcUrl}`)
  logger.debug(
    `Verida Mainnet Meta Transaction Server: ${config.verida.mainnet.metaTransactionServerUrl}`
  )
  logger.debug(
    `Verida Mainnet Notification Server: ${config.verida.mainnet.notificationServerUrls}`
  )
  logger.debug(
    `Verida Mainnet Data Connector Server: ${config.verida.mainnet.dataConnectorServerUrl}`
  )
  logger.debug(` `)
  logger.debug(`Verida Wallet Provider: ${config.walletProvider.url}`)
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
  logger.debug(
    `Infura API Key: ${config.blockchain.infuraApiKey ? 'set' : 'not set'}`
  )
  logger.debug(`IPFS Gateway URL: ${config.polygonId.common.ipfsGatewayUrl}`)
  logger.debug(` `)
  logger.debug(`WalletConnect Relay URL: ${config.walletConnect.relayUrl}`)
  logger.debug(
    `Wallet Project Id: ${config.walletConnect.projectId ? 'set' : 'not set'}`
  )
  // Complete logs of config here if needed
  logger.debug('========================')
}
