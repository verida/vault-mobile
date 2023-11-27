import { config } from 'config'
import { getPolygonIdPrivateKey } from 'features/polygonid/utils'
import { Logger } from 'features/telemetry'
import * as React from 'react'

import AccountManager from 'api/AccountManager'

import { Stateful } from '../../@types'
import { PolygonIdConfig, PolygonIdManagerConfig } from '../@types'
import { usePolygonContext } from '../contexts'

const logger = new Logger('Polygon ID')

type PolygonIdPartialConfig = Omit<PolygonIdConfig, 'polygonIdPrivateKey'>

export const polygonIdTestnetConfig: PolygonIdPartialConfig = {
  polygonIdBlockchain: config.polygonId.common.blockchain,
  polygonIdDidMethod: config.polygonId.common.didMethod,
  polygonIdIpfsGatewayUrl: config.polygonId.common.ipfsGatewayUrl,
  polygonIdRevocationType: config.polygonId.common.revocationType,
  polygonIdNetworkId: config.polygonId.testnet.networkId,
  polygonIdRevocationBaseUrl: config.polygonId.testnet.revocationBaseUrl,
  polygonIdRpcUrl: config.polygonId.testnet.rpcUrl,
  polygonIdContractAddress: config.polygonId.testnet.contractAddress,
}

export const polygonIdMainnetConfig: PolygonIdPartialConfig = {
  polygonIdBlockchain: config.polygonId.common.blockchain,
  polygonIdDidMethod: config.polygonId.common.didMethod,
  polygonIdIpfsGatewayUrl: config.polygonId.common.ipfsGatewayUrl,
  polygonIdRevocationType: config.polygonId.common.revocationType,
  polygonIdNetworkId: config.polygonId.mainnet.networkId,
  polygonIdRevocationBaseUrl: config.polygonId.mainnet.revocationBaseUrl,
  polygonIdRpcUrl: config.polygonId.mainnet.rpcUrl,
  polygonIdContractAddress: config.polygonId.mainnet.contractAddress,
}

// TODO: Base the Polygon ID network on the Verida network (Testnet or Mainnet) when available
const polygonIdNetwork: 'mainnet' | 'testnet' = 'mainnet'

const polygonIdConfig =
  polygonIdNetwork === 'mainnet'
    ? polygonIdMainnetConfig
    : polygonIdTestnetConfig

const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useCreatePolygonIdManager(): Stateful<string> {
  const [state, setState] = React.useState<Stateful<string>>(loadingState)
  const { createIdManager, isReady: isPolygonIdReady } = usePolygonContext()

  // TODO: Handle account switching
  const accountManager = AccountManager.getInstance()
  const account = accountManager.getSelectedAccount()

  React.useEffect(() => {
    logger.debug('Checking to create a new Polygon ID Manager')
    setState(loadingState)
    if (!isPolygonIdReady) {
      logger.debug(
        'Polygon ID is not ready, cannot create Polygon ID Manager yet'
      )
      return
    }
    if (!account || !account.privateKey) {
      logger.warn('No Verida account, cannot create Polygon ID Manager yet')
      return
    }

    logger.info('Polygon ID is ready and Verida account is available')

    // TODO: Find a better way to pass the sensitive information to the manager.
    const polygonIdManagerConfig: PolygonIdManagerConfig = {
      veridaPrivateKey: account.privateKey,
      veridaEnvironment: config.VERIDA_ENVIRONMENT,
      veridaContextName: config.VERIDA_CONTEXT_NAME,
      veridaDidClientConfig: config.VERIDA_DID_CLIENT_CONFIG,
      veridaCredentialRecordSchema:
        'https://common.schemas.verida.io/credential/base/v0.2.0/schema.json',
      // PolygonID Private Key is a 32 char hex
      // Make it the same as the Verida identity so there is a 1:1 relationship
      polygonIdPrivateKey: getPolygonIdPrivateKey(account.privateKey),
      ...polygonIdConfig,
    }

    const init = async () => {
      try {
        logger.info('Creating a new Polygon ID Manager')
        const managerId = await createIdManager(polygonIdManagerConfig)
        logger.info('New Polygon ID Manager created', { managerId })

        setState({ loading: false, result: managerId })
      } catch (error) {
        logger.warn('Error while creating a Polygon ID Manager')
        setState({
          loading: false,
          error: new Error('Failed to create PolygonIdManager', {
            cause: error,
          }),
        })
      }
    }
    init()
  }, [account, createIdManager, isPolygonIdReady])

  return state
}
