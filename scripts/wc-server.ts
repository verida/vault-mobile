import { SignClient } from '@walletconnect/sign-client'

// eslint-disable-next-line no-void
void (async () => {
  try {
    const proposalNamespace = {
      eip155: {
        methods: ['eth_sendTransaction'],
        chains: ['eip155:5'],
        events: [],
      },
    }

    const signClient = await SignClient.init({
      // HACK: This is a burner projectId. It is useful only for experimentation.
      projectId: 'ba6086f6dafcad46bb4555a36647396c',
    })

    const { uri, approval } = await signClient.connect({
      requiredNamespaces: proposalNamespace,
    })

    // eslint-disable-next-line no-console
    console.log(uri)

    await approval()

    // eslint-disable-next-line no-console
    console.log('Session approved.')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
