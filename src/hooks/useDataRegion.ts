import { useEffect } from 'react'
import { fetchNetworkCountries, fetchNetworks } from 'api/utils'
import { getUserCountryCode } from 'utils/profile'
import { NetworkCountry } from 'api/types'
import { useDispatch, useSelector } from 'react-redux'
import { get } from 'lodash'
import * as Sentry from '@sentry/react-native'
import { setNetworks } from 'reduxStore/general/actions'

export function useDataRegion() {
  const dispatch = useDispatch()
  const selectedAccount = useSelector((state: any) => state.selectedAccount)

  useEffect(() => {
    async function init() {
      try {
        const networks = await fetchNetworks()
        const countries = await fetchNetworkCountries()
        const userCountryCode = await getUserCountryCode()
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

        dispatch(setNetworks(transformedNetworks))
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    if (selectedAccount) {
      init()
    }
  }, [dispatch, selectedAccount])
}
