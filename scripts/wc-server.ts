import { SignClient } from '@walletconnect/sign-client'
import { ChainId } from 'caip'
import * as child_process from 'child_process'

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
    const proposalNamespace = {
      eip155: {
        methods: ['eth_sendTransaction', 'wallet_addEthereumChain'],
        chains: ['eip155:5'],
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

    await signClient.request(
      mockAddEthereumChainRequest({
        topic,
        chainId: new ChainId('eip155:5'),
        params: [xDAI],
      })
    )
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
