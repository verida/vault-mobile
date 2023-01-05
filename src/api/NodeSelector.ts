const DEFAULT_COUNTRY = 'US'
const NOTIFICATION_ENDPOINTS = ['https://notifications.testnet.verida.tech/']

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

// @todo: Move this to a JSON file
// https://assets.verida.io/registry/storageNodes/testnet.json
// Afgahnistan = localhost
// AU = sydney nodes
// US = ohio nodes
const storageNodes: StorageNode[] = [
  {
    id: 'localhost-001',
    name: 'Localhost 001',
    description: 'Node running on localhost',
    datacenter: 'local',
    serviceEndpoint: 'http://192.168.68.107:5000/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'AF',
  },
  {
    id: 'localhost-002',
    name: 'Localhost 002',
    description: 'Node running on localhost',
    datacenter: 'local',
    serviceEndpoint: 'http://192.168.68.124:5000/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'AF',
  },
  ////
  {
    id: 'verida-testnet-aws-ap-southeast-2-001',
    name: 'Verida Foundation Testnet: AWS (Sydney) 001',
    description: 'Node operated by the Verida Foundation on Testnet',
    datacenter: 'aws-ap-southeast-2',
    serviceEndpoint: 'https://acacia-au-dev1.tn.verida.tech/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'AU',
  },
  {
    id: 'verida-testnet-aws-ap-southeast-2-002',
    name: 'Verida Foundation Testnet: AWS (Sydney) 002',
    description: 'Node operated by the Verida Foundation on Testnet',
    datacenter: 'aws-ap-southeast-2',
    serviceEndpoint: 'https://acacia-au-dev2.tn.verida.tech/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'AU',
  },
  {
    id: 'verida-testnet-aws-ap-southeast-2-003',
    name: 'Verida Foundation Testnet: AWS (Sydney) 003',
    description: 'Node operated by the Verida Foundation on Testnet',
    datacenter: 'aws-ap-southeast-2',
    serviceEndpoint: 'https://acacia-au-dev3.tn.verida.tech/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'AU',
  },
  {
    id: 'verida-testnet-aws-us-east-2-001',
    name: 'Verida Foundation Testnet: AWS (Ohio) 001',
    description: 'Node operated by the Verida Foundation on Testnet',
    datacenter: 'aws-us-east-2',
    serviceEndpoint: 'https://acacia-dev1.tn.verida.tech/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'US',
  },
  {
    id: 'verida-testnet-aws-us-east-2-002',
    name: 'Verida Foundation Testnet: AWS (Ohio) 002',
    description: 'Node operated by the Verida Foundation on Testnet',
    datacenter: 'aws-us-east-2',
    serviceEndpoint: 'https://acacia-dev2.tn.verida.tech/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'US',
  },
  {
    id: 'verida-testnet-aws-us-east-2-003',
    name: 'Verida Foundation Testnet: AWS (Ohio) 003',
    description: 'Node operated by the Verida Foundation on Testnet',
    datacenter: 'aws-us-east-2',
    serviceEndpoint: 'https://acacia-dev3.tn.verida.tech/',
    establishmentDate: '2023-01-03T08:22:35Z',
    countryLocation: 'US',
  },
]

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

  // @todo: Check the nodes have capacity
  static selectNodes(countryCode: string, numNodes = 3) {
    const countryNodes = NodeSelector.nodesByCountry()
    if (!countryNodes[countryCode]) {
      countryCode = DEFAULT_COUNTRY
    }

    const possibleNodes: StorageNode[] = countryNodes[countryCode]
    const selectedNodes: StorageNode[] = []

    while (selectedNodes.length < numNodes && possibleNodes.length > 0) {
      const nodeIndex = getRandomInt(0, possibleNodes.length)
      selectedNodes.push(possibleNodes[nodeIndex])
      possibleNodes.splice(nodeIndex, 1)
    }

    return selectedNodes
  }

  static selectEndpointUris(countryCode: string, numNodes = 3) {
    const nodes = NodeSelector.selectNodes(countryCode, numNodes)
    return nodes.reduce((result: any, item: StorageNode) => {
      result.push(item.serviceEndpoint)
      return result
    }, [])
  }

  static nodesByCountry() {
    return storageNodes.reduce((result: any, item: StorageNode) => {
      if (!result[item.countryLocation]) {
        result[item.countryLocation] = []
      }

      result[item.countryLocation].push(item)
      return result
    }, {})
  }

  static notificationEndpoints() {
    return NOTIFICATION_ENDPOINTS
  }
}
