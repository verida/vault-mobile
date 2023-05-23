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
  const { createIdManager, isReady: isPolygonIdReady } = usePolygonContext()

  // TODO: Handle account switching
  const accountManager = AccountManager.getInstance()
  const account = accountManager.getSelectedAccount()

  React.useEffect(() => {
    console.debug(
      'useCreatePolygonIdManager ~ Trying to create a new Polygon ID Manager'
    )
    setState(loadingState)
    if (!isPolygonIdReady) {
      console.debug(
        'useCreatePolygonIdManager ~ Polygon ID is not ready, cannot create Polygon ID Manager'
      )
      return
    }
    if (!account) {
      console.debug(
        'useCreatePolygonIdManager ~ No Verida account, cannot create Polygon ID Manager'
      )
      return
    }

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
      // PolygonID Private Key is a 32 char hex
      // Make it the same as the Verida identity so there is a 1:1 relationship
      polygonIdPrivateKey: getPolygonIdPrivateKey(account.privateKey),
      // TODO: Get the values from the enums once the Polygon ID SDK can be added without issue
      polygonIdBlockchain: 'polygon',
      polygonIdNetworkId: 'mumbai', // TODO: Base this on whether the DID is mainnet or testnet/devnet
      polygonIdDidMethod: 'polygonid',
      // TODO: Ask Polygon ID team about revocation
      polygonIdRevocationBaseUrl: 'https://rhs-staging.polygonid.me/',
      polygonIdRevocationType: 'Iden3ReverseSparseMerkleTreeProof',
    }

    const init = async () => {
      try {
        console.debug(
          'useCreatePolygonIdManager ~ Creating a new Polygon ID Manager'
        )
        const managerId = await createIdManager(config)
        console.debug(
          'useCreatePolygonIdManager ~ New Polygon ID Manager created:',
          managerId
        )

        setState({ loading: false, result: managerId })
      } catch (cause) {
        console.error(
          'useCreatePolygonIdManager ~ Error while creating a Polygon ID Manager'
        )
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
