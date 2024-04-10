import 'jest'

import { AddEthereumChainRequestParam } from '~/features/blockchain/eip155/types'

describe('blockchain/eip155/@types', () => {
  it('AddEthereumChainRequestParam', () => {
    const xdai = {
      chainId: '0x64',
      chainName: 'Gnosis Chain',
      rpcUrls: ['https://rpc.gnosischain.com/'],
      nativeCurrency: { name: 'xDAI', symbol: 'xDAI' },
      blockExplorerUrls: ['https://blockscout.com/xdai/mainnet/'],
    }

    const { success: xdaiSuccess } =
      AddEthereumChainRequestParam.safeParse(xdai)

    expect(xdaiSuccess).toBeTruthy()

    const { success: xdaiWithoutRpcUrls } =
      AddEthereumChainRequestParam.safeParse({ ...xdai, rpcUrls: [] })

    expect(xdaiWithoutRpcUrls).toBeFalsy()

    const { success: xdaiWithInvalidRpcUrl } =
      AddEthereumChainRequestParam.safeParse({
        ...xdai,
        rpcUrls: ['invalid rpc'],
      })

    expect(xdaiWithInvalidRpcUrl).toBeFalsy()

    const { success: xdaiWithInvalidChainId } =
      AddEthereumChainRequestParam.safeParse({ ...xdai, chainId: '100' })

    expect(xdaiWithInvalidChainId).toBeFalsy()

    const { success: xdaiWithInvalidChainId2 } =
      AddEthereumChainRequestParam.safeParse({ ...xdai, chainId: '0x' })

    expect(xdaiWithInvalidChainId2).toBeFalsy()
  })
})
