import 'jest'

import { CustomBlockchain } from '~/features/blockchain/types/blockchain'
import { chainMetadataToMaybeCustomBlockchainNetwork } from '~/features/blockchain/utils/chainMetadataToMaybeCustomBlockchainNetwork'
import { customBlockchainNetworkToMaybeChainMetadata } from '~/features/blockchain/utils/customBlockchainNetworkToMaybeChainMetadata'

describe('blockchain/utils/customBlockchainNetworkToMaybeChainMetadata', () => {
  it('customBlockchainNetworkToMaybeChainMetadata', () => {
    const customBlockchainNetwork: CustomBlockchain = {
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
