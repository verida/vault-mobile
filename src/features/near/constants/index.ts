import { NearNetworkId } from 'features/near'

import type { WalletConnectChainMeta } from '../../walletConnect/@types'

export const NEAR_CHAIN_TESTNET = 'near:testnet'

// TODO: move this to WalletConnect instead
export const NEAR_WALLETCONNECT_CHAIN_META: Record<
  string,
  WalletConnectChainMeta<NearNetworkId>
> = {
  [NEAR_CHAIN_TESTNET]: {
    chainId: 'testnet',
    name: 'NEAR Testnet',
    logo: '/chain-logos/near.png',
    rgb: '99, 125, 234',
    rpc: 'https://rpc.testnet.near.org',
  },
}
