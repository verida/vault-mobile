import { SignClient } from '@walletconnect/sign-client'
import { ChainId } from 'caip'
import * as child_process from 'child_process'
import { AddEthereumChainRequestParam } from 'features/blockchain/eip155/@types'
import localhost from 'react-native-localhost'

import {
  fetchChainsList,
  getMaybeAddEthereumChainRequestParamByChainId,
} from '../src/features/blockchain/eip155/utils/chainsList'
import { mockAddEthereumChainRequest } from '../src/features/walletConnect/utils/mockAddEthereumChainRequest'

const openDeepLinkInSimulator = (uri: string) => {
  child_process.execSync(`xcrun simctl openurl booted "${uri}"`, {
    stdio: 'inherit',
  })
}

const createSignClient = () =>
  SignClient.init({
    // HACK: This is a burner projectId. It is useful only for experimentation.
    projectId: 'ba6086f6dafcad46bb4555a36647396c',
    metadata: {
      name: 'Verida CLI',
      description: 'A utility to help debug WalletConnect in the Verida Vault.',
      url: 'https://www.verida.io/',
      icons: [
        'https://upload.wikimedia.org/wikipedia/commons/b/b3/Terminalicon2.png',
      ],
    },
  })

// eslint-disable-next-line no-void
void (async () => {
  try {
    // XXX: This identifies the chain the app is currently connected to
    //      and does not relate to the chains we intend to add. Here, we
    //      just assume it is connected to ETH Goerli.
    const proposalChainId = 'eip155:5'

    const proposalNamespace = {
      eip155: {
        methods: ['eth_sendTransaction', 'wallet_addEthereumChain'],
        chains: [proposalChainId],
        events: [],
      },
    }

    const signClient = await createSignClient()

    const { uri, approval } = await signClient.connect({
      requiredNamespaces: proposalNamespace,
    })

    openDeepLinkInSimulator(String(uri))

    const { topic } = await approval()

    // eslint-disable-next-line no-console
    console.log(topic)

    const [chainsList] = await Promise.all([
      fetchChainsList(),
      // HACK: If we try to open the Modal too quickly, PointerEvents on
      //       the modal do not propagate to any views!
      // TODO: The native modal library is doing something strange with
      //       the touch context - opening a new dialog too quickly results
      //       in the events becoming orphaned. It might make sense to force
      //       all requests to open the native modal into a delay queue.
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ])

    const xDAI = getMaybeAddEthereumChainRequestParamByChainId({
      chainId: 100,
      chainsList,
    })

    if (!xDAI) throw new Error(`Expected xDAI, encountered "${String(xDAI)}".`)

    const anvil: AddEthereumChainRequestParam = {
      blockExplorerUrls: [],
      chainId: `0x${Number(31337).toString(16)}`,
      chainName: 'Anvil',
      rpcUrls: [`http://${localhost}:8545`],
      nativeCurrency: {
        name: 'Anvil Test ETH',
        symbol: 'aETH',
      },
    }

    await signClient.request(
      mockAddEthereumChainRequest({
        topic,
        chainId: new ChainId(proposalChainId),
        params: [anvil, xDAI],
      })
    )
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
