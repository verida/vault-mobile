import * as Sentry from '@sentry/react-native'
import { get, isEmpty } from 'lodash'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { NetworkCountry } from 'api/types'
import { fetchNetworkCountries, fetchNetworks } from 'api/utils'
import { setNetworks } from 'reduxStore/general/actions'
import { getUserCountryCode } from 'utils/profile'
import AccountManager from "api/AccountManager";

export function useDataRegion() {
  const dispatch = useDispatch()
  const selectedAccount = useSelector((state: any) => state.selectedAccount)

  useEffect(() => {
    async function init() {
      try {
        const networks = await fetchNetworks()
        console.log('networks:', networks)
        const countries = await fetchNetworkCountries()
        console.log('countries:', countries)

        const userCountryCode = await getUserCountryCode()
        console.log('userCountryCode:', userCountryCode)
        const transformedNetworks = networks.map((network) => {
          let selectedNodeFromUserChoice = null
          let selectedNodeFromDefault = 0
          const countriesData: NetworkCountry[] = get(
            countries,
            network.name,
            []
          )
          let nodeCodeBasedOnUserCountry: string | null = null
          countriesData.forEach((country) => {
            Object.keys(country).forEach((key) => {
              if (key === userCountryCode) {
                nodeCodeBasedOnUserCountry = country[key]
              }
            })
          })

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
        const selectedNode =
          !isEmpty(networks) && networks[0].selected_node
            ? networks[0].nodes[networks[0].selected_node]
            : null

        if(selectedNode) {
          AccountManager.getInstance()
        }

        dispatch(setNetworks(transformedNetworks))
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    init()
  }, [dispatch, selectedAccount])
}
