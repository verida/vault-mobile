import { getPolygonIdPrivateKey } from 'features/polygonid/utils'
import * as React from 'react'

import AccountManager from 'api/AccountManager'
import CONFIG from 'config/environment'

import { Stateful } from '../../@types'
import { PolygonIdManagerConfig } from '../@types'
import { usePolygonContext } from '../contexts'

const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useCreatePolygonIdManager(): Stateful<string> {
  const [state, setState] = React.useState<Stateful<string>>(loadingState)
  const { createIdManager, loading: polygonIsLoading } = usePolygonContext()

  // TODO: Handle account switching
  const accountManager = AccountManager.getInstance()
  const account = accountManager.getSelectedAccount()

  React.useEffect(() => {
    if (!account) {
      return
    }

    // TODO: Define the config based on the current selected Account
    // TODO: Find a better way to pass the sensitive information to the manager.
    const config: PolygonIdManagerConfig = {
      // PolygonID Private Key is a 32 char hex
      // Make it the same as the Verida identity so there is a 1:1 relationship
      polygonIdPrivateKey: getPolygonIdPrivateKey(account.privateKey),
      veridaPrivateKey: account.privateKey,
      environment: CONFIG.VERIDA_ENVIRONMENT,
      contextName: CONFIG.VERIDA_CONTEXT_NAME,
      didClientConfig: {
        ...CONFIG.VERIDA_DID_CLIENT_CONFIG,
        // Currently have to ovrerride the callType because the config comes from a non-typescript file
        callType: 'gasless',
        didEndpoints: [],
      },
    }

    const init = async () => {
      try {
        setState(loadingState)
        if (polygonIsLoading) {
          return
        }

        console.debug(
          'useCreatePolygonIdManager.ts ~ React.useEffect ~ config:',
          config
        )
        const managerId = await createIdManager(config)

        setState({ loading: false, result: managerId })
      } catch (cause) {
        setState({
          loading: false,
          error: new Error('Failed to create PolygonIdManager.', { cause }),
        })
      }
    }
    init()
  }, [account, createIdManager, polygonIsLoading])

  return state
}
