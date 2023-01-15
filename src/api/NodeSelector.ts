import Axios from 'axios'

import CONFIG from '../config/environment'
import { fetchConfigJson } from './utils'

interface StorageNode {
  id: string
  name: string
  description: string
  datacenter: string
  serviceEndpoint: string
  establishmentDate: string
  countryLocation: string
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}

/*const dataCentres: object[] = [
  {
    id: 'aws-us-east-2',
    name: 'Amazon Web Services: US East 2 (Ohio)',
    countryLocation: 'US',
    latitude: 40.10149,
    longitude: -83.4797668,
  },
  {
    id: 'aws-ap-southeast-2',
    name: 'Amazon Web Services: Asia Pacific South East 2 (Sydney)',
    countryLocation: 'AU',
    latitude: -33.8727631,
    longitude: 151.2054683,
  },
]*/

export default class NodeSelector {
  /**
   * Select random nodes for a given country code
   * @param countryCode 2-character country code
   * @param numNodes Number of nodes to randomly select
   * @returns Array of found storage nodes up to `numNodes` maximum
   */
  static async selectNodes(
    countryCode: string,
    numNodes = 3
  ): Promise<StorageNode[]> {
    const countryNodes = await NodeSelector.nodesByCountry()

    if (!countryNodes[countryCode]) {
      countryCode = CONFIG.DEFAULT_COUNTRY
    }

    const possibleNodes: StorageNode[] = countryNodes[countryCode]
    const selectedNodes: StorageNode[] = []

    while (selectedNodes.length < numNodes && possibleNodes.length > 0) {
      const nodeIndex = getRandomInt(0, possibleNodes.length)
      const possibleNode = possibleNodes[nodeIndex]
      const nodeAvailable = await NodeSelector.verifyNodeAvailable(possibleNode)

      if (nodeAvailable) {
        selectedNodes.push(possibleNode)
      }

      possibleNodes.splice(nodeIndex, 1)
    }

    return selectedNodes
  }

  static async selectEndpointUris(
    countryCode?: string,
    numNodes = 3
  ): Promise<string[]> {
    const nodes = await NodeSelector.selectNodes(
      countryCode ? countryCode : CONFIG.DEFAULT_COUNTRY,
      numNodes
    )
    return nodes.reduce((result: any, item: StorageNode) => {
      result.push(item.serviceEndpoint)
      return result
    }, [])
  }

  static async nodesByCountry() {
    const storageNodes = await NodeSelector.loadStorageNodes()

    return storageNodes.reduce((result: any, item: StorageNode) => {
      if (!result[item.countryLocation]) {
        result[item.countryLocation] = []
      }

      result[item.countryLocation].push(item)
      return result
    }, {})
  }

  static notificationEndpoints() {
    return CONFIG.NOTIFICATION_ENDPOINTS
  }

  static async verifyNodeAvailable(storageNode: StorageNode) {
    try {
      const statusResponse = await Axios.get(
        `${storageNode.serviceEndpoint}status`,
        {
          timeout: CONFIG.DEFAULT_REMOTE_REQUEST_TIMEOUT,
        }
      )

      const results = statusResponse.data.results
      console.log(
        `endpointUri: Status fetched ${results.currentUsers} / ${results.maxUsers}`
      )

      if (parseInt(results.currentUsers) < parseInt(results.maxUsers)) {
        return true
      }

      return false
    } catch (err: any) {
      console.log(
        `Storage node ${storageNode.serviceEndpoint} unavailable: ${err.message}`
      )
      return false
    }
  }

  static async loadStorageNodes(): Promise<StorageNode[]> {
    const nodeList = await fetchConfigJson(CONFIG.STORAGE_NODES_URI)
    const nodes: StorageNode[] = []
    for (const n in nodeList) {
      nodes.push(<StorageNode>nodeList[n])
    }

    return nodes
  }
}
