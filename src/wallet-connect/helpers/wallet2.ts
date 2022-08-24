import SignClient from '@walletconnect/sign-client'

export let signClient: SignClient

export async function getWC2SignClient() {
  if (signClient) return signClient
  signClient = await SignClient.init({
    projectId: '58c4c4df28f92213e81f7d83312d3fa9',
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
