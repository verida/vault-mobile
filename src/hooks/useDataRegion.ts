import * as Sentry from '@sentry/react-native'
import { get, isEmpty } from 'lodash'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { NetworkCountry } from 'api/types'
import { fetchNetworkCountries, fetchNetworks } from 'api/utils'
import { useAuth } from 'hooks/useAuth'
import { setCountries, setNetworks } from 'reduxStore/general/actions'
import { getUserCountryCode } from 'utils/profile'

// Temporary. This will be configurable by user
const DEFAULT_NETWORK = 'testnet'

/**
 * Initialize data region from remote json config files.
 * Result will be dispatched in Redux store.
 * Re-run automatically on each account selection.
 */
export function useDataRegion() {
  const dispatch = useDispatch()
  const selectedAccount = useSelector(
    (state: any) => state.main.selectedAccount
  )
  const { loaded } = useAuth()

  useEffect(() => {
    async function init() {
      try {
        // List of Verida's storage nodes
        const networks = await fetchNetworks()
        // List of node codes mapped to each country codes
        const countries = await fetchNetworkCountries()
        if (!isEmpty(countries)) {
          dispatch(setCountries(get(countries, DEFAULT_NETWORK, [])))
        }
        const userCountryCode = await getUserCountryCode()

        // Transform networks data so that each of them will have a selected node
        const transformedNetworks = networks.map((network) => {
          let selectedNodeFromUserChoice = null
          let selectedNodeFromDefault = 0
          const countriesData: NetworkCountry[] = get(
            countries,
            network.name,
            []
          )

          // Selected node code is based on which country user selected during account creation
          let nodeCodeBasedOnUserCountry: string | null = null
          countriesData.forEach((country) => {
            Object.keys(country).forEach((key) => {
              if (key === userCountryCode) {
                nodeCodeBasedOnUserCountry = country[key]
              }
            })
          })

          // Find out if selected node should be from user's country or default.
          network.nodes.forEach((node, index) => {
            if (node.node_code === nodeCodeBasedOnUserCountry) {
              selectedNodeFromUserChoice = index
            }

            if (node.node_code === network.default_node_code) {
              selectedNodeFromDefault = index
            }
          })

          return {
            ...network,
            selected_node:
              selectedNodeFromUserChoice !== null
                ? selectedNodeFromUserChoice
                : selectedNodeFromDefault,
          }
        })

        dispatch(setNetworks(transformedNetworks))
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    if (loaded) {
      init()
    }
  }, [dispatch, selectedAccount, loaded])
}
