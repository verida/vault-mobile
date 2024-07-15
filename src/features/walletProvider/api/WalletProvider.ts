import { create } from 'apisauce'

import { config } from '~/config'

// TODO: Do we keep this? It's barely used

/**
 * @deprecated
 */
export const walletProviderApi = create({
  baseURL: config.walletProvider.url,
})
