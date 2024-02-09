import 'jest'

import { CustomBlockchainNetwork } from '../../../src/features/blockchain/@types'
import {
  chainMetadataToMaybeCustomBlockchainNetwork,
  customBlockchainNetworkToMaybeChainMetadata,
} from '../../../src/features/blockchain/utils'

describe('blockchain/utils/customBlockchainNetworkToMaybeChainMetadata', () => {
  it('customBlockchainNetworkToMaybeChainMetadata', () => {
    const customBlockchainNetwork: CustomBlockchainNetwork = {
      label: 'My custom blockchain network',
      rpcUrls: ['https://mycustomrpc.com/'],
      chainId: {
        namespace: 'eip155',
        reference: '4',
      },
      isMainnet: true,
      nativeCurrency: {
        label: 'Native currency label',
        decimals: 99,
        symbol: 'N',
      },
      blockExplorers: [
        {
          url: 'https://my-block-explorer.net',
        },
      ],
      icon: 'https://my-icon.com/graphics.png',
    }

    expect(
      customBlockchainNetworkToMaybeChainMetadata({
        customBlockchainNetwork,
      })
    ).toMatchSnapshot()

    expect(
      chainMetadataToMaybeCustomBlockchainNetwork({
        chainMetadata: customBlockchainNetworkToMaybeChainMetadata({
          customBlockchainNetwork,
        })!,
      })
    ).toEqual(customBlockchainNetwork)
  })
})
