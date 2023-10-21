import 'jest'

import { SupportedCaipNamespace } from 'features/caip/@types'

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
        chainMetadatas: [
          {
            name: 'My Ethereum :)',
            rpc: '$TEST_RPC_URL',
            namespace: SupportedCaipNamespace.EIP_155,
            reference: '1',
          },
        ],
      })
    ).toMatchSnapshot()
  })
})
