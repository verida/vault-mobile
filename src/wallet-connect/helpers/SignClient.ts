import SignClient from '@walletconnect/sign-client'

export let signClient: SignClient

export async function getWC2SignClient(): Promise<SignClient> {
  if (signClient) return signClient

  signClient = await SignClient.init({
    // TODO: to environment variable
    projectId: '1890472fb88366dd4046858b11e705cd',

    relayUrl: 'wss://relay.walletconnect.com',
    metadata: {
      name: 'Verida Vault',
      description: 'Verida Vault for WalletConnect',
      url: 'https://walletconnect.com/',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  })

  return signClient
}
