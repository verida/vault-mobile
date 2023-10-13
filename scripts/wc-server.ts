import { SignClient } from '@walletconnect/sign-client'
import * as child_process from 'child_process'

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
      name: 'Verida Development',
      description: 'A utility to help debug WalletConnect in the Verida Vault.',
      url: 'https://www.verida.io/',
      icons: [
        'https://yt3.ggpht.com/ytc/APkrFKabi2p4h6kk7OQsDY7L6ZYx92eDf3VnW_RyWQFL=s68-c-k-c0x00ffffff-no-rj',
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

    // HACK: If we try to open the Modal too quickly, PointerEvents on
    //       the modal do not propagate to any views!
    // TODO: The native modal library is doing something strange with
    //       the touch context - opening a new dialog too quickly results
    //       in the events becoming orphaned. It might make sense to force
    //       all requests to open the native modal into a delay queue.
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await signClient.request({
      topic,
      chainId: 'eip155:5',
      request: {
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x64',
            chainName: 'Gnosis Chain',
            rpcUrls: ['https://rpc.gnosischain.com/'],
            nativeCurrency: { name: 'xDAI', symbol: 'xDAI' },
            blockExplorerUrls: ['https://blockscout.com/xdai/mainnet/'],
          },
        ],
      },
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
