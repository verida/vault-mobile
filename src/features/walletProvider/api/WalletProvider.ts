import { create } from 'apisauce'
import { config } from 'config'

// TODO: Do we keep this? It's barely used

export const walletProviderApi = create({
  baseURL: config.walletProvider.url,
})
