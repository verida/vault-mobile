import 'jest'

import { SupportedBlockchainNamespace } from 'features/blockchain/@types/enums'

import {
  chainMetadatasToAddEthereumChainRequestParamsOrThrow,
  fetchChainsList,
  getMaybeAddEthereumChainRequestParamByChainId,
} from '../../../../src/features/blockchain/eip155/utils/chainsList'

jest.setTimeout(10 * 1000)

let chainsList: Awaited<ReturnType<typeof fetchChainsList>> | undefined

beforeAll(async () => {
  chainsList = await fetchChainsList()

  if (!Array.isArray(chainsList) || !chainsList.length)
    throw new Error(`Was unable to determine chainsList.`)
})

describe('blockchain/eip155/utils/chainsList', () => {
  it('chainsListMiniItemToAddEthereumRequestParam:xDai', async () => {
    expect(chainsList!.length).toBeGreaterThan(0)

    expect(
      getMaybeAddEthereumChainRequestParamByChainId({
        chainId: 100,
        chainsList: chainsList!,
      })
    ).toMatchSnapshot()
  })

  it('chainMetadatasToAddEthereumChainRequestParamsOrThrow::Mainnet', async () => {
    // Ensure that not only we can find a valid configuration, but
    // we also respect the original configuration defined by the caller -
    // chainMetadatasToAddEthereumChainRequestParamsOrThrow should only provide
    // supplementary missing information where applicable.
    expect(
      chainMetadatasToAddEthereumChainRequestParamsOrThrow({
        chainsList: chainsList!,
        // TODO: chainMetadatas should just use the chainListItem implementation
        chainMetadatas: [
          {
            name: 'My Ethereum :)',
            rpcUrls: ['$TEST_RPC_URL'],
            namespace: SupportedBlockchainNamespace.EIP_155,
            reference: '1',
            decimals: 6,
            nativeCurrencyName: 'MyEther',
            symbol: 'MY',
            icon: 'trollface.png',
            blockExplorers: [{ url: 'https://my.block.explorer.net/' }],
            isMainnet: false,
          },
        ],
      })
    ).toMatchSnapshot()
  })
})
