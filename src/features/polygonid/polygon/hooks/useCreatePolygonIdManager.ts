import {
  polygonIdMainnetConfig,
  polygonIdTestnetConfig,
} from 'features/polygonid/constants'
import { getPolygonIdPrivateKey } from 'features/polygonid/utils'
import { Logger } from 'features/telemetry'
import * as React from 'react'

import AccountManager from 'api/AccountManager'
import CONFIG from 'config/environment'

import { Stateful } from '../../@types'
import { PolygonIdManagerConfig } from '../@types'
import { usePolygonContext } from '../contexts'

const logger = new Logger('Polygon ID')

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
    logger.debug('Trying to create a new Polygon ID Manager')
    setState(loadingState)
    if (!isPolygonIdReady) {
      logger.debug('Polygon ID is not ready, cannot create Polygon ID Manager')
      return
    }
    if (!account) {
      logger.debug('No Verida account, cannot create Polygon ID Manager')
      return
    }

    // TODO: Base the Polygon ID network on the Verida network (Testnet or Mainnet) when available
    const polygonIdNetwork: 'mainnet' | 'testnet' = 'mainnet'

    const polygonIdConfig =
      polygonIdNetwork === 'mainnet'
        ? polygonIdMainnetConfig
        : polygonIdTestnetConfig

    // TODO: Find a better way to pass the sensitive information to the manager.
    const config: PolygonIdManagerConfig = {
      veridaPrivateKey: account.privateKey,
      veridaEnvironment: CONFIG.VERIDA_ENVIRONMENT,
      veridaContextName: CONFIG.VERIDA_CONTEXT_NAME,
      veridaDidClientConfig: {
        ...CONFIG.VERIDA_DID_CLIENT_CONFIG,
        // Currently have to ovrerride the callType because the config comes from a non-typescript file
        callType: 'gasless',
      },
      veridaCredentialRecordSchema:
        'https://common.schemas.verida.io/credential/base/v0.2.0/schema.json',
      // PolygonID Private Key is a 32 char hex
      // Make it the same as the Verida identity so there is a 1:1 relationship
      polygonIdPrivateKey: getPolygonIdPrivateKey(account.privateKey),
      ...polygonIdConfig,
    }

    const init = async () => {
      try {
        logger.debug('Creating a new Polygon ID Manager')
        const managerId = await createIdManager(config)
        logger.debug('New Polygon ID Manager created', { managerId })

        setState({ loading: false, result: managerId })
      } catch (cause) {
        logger.error('Error while creating a Polygon ID Manager')
        setState({
          loading: false,
          error: new Error('Failed to create PolygonIdManager.', { cause }),
        })
      }
    }
    init()
  }, [account, createIdManager, isPolygonIdReady])

  return state
}
