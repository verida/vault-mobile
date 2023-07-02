import { NearNetworkId } from 'features/near'
import type { WalletConnectChainMeta } from 'features/walletConnect'
import { WalletConnectChainStyle } from 'features/walletConnect'

const WALLETCONNECT_PROTOCOL = 'wc:'

//// Ex: wc:9145e975-4af0-4a28-a569-19aab7a21dd8@1?bridge=https%3A%2F%2F6.bridge.walletconnect.org&key=40dbb09f0eac060885a0edaf7f1ab7efba207c9b339bc49f805d61b615ac28a7
export const isWalletConnectV1Connection = (
  maybeWalletConnectV1Connection: unknown
): maybeWalletConnectV1Connection is string => {
  if (typeof maybeWalletConnectV1Connection !== 'string') return false

  return (
    maybeWalletConnectV1Connection.startsWith(WALLETCONNECT_PROTOCOL) &&
    maybeWalletConnectV1Connection.indexOf('bridge') >= 0
  )
}

//// Ex: 'wc:c034ac9bf61c23d3e551663ed8bf973c260130c12f89f22a35a5d1032e3c47af@2?relay-protocol=iridium&symKey=05f034367d195bca2532385b620bd2b2a6c5c62101050bdfe9253e283fe50e12'
export const isWalletConnectV2Connection = (
  maybeWalletConnectV2Connection: unknown
): maybeWalletConnectV2Connection is string => {
  if (typeof maybeWalletConnectV2Connection !== 'string') return false

  return (
    maybeWalletConnectV2Connection.startsWith(WALLETCONNECT_PROTOCOL) &&
    maybeWalletConnectV2Connection.indexOf('relay-protocol') >= 0
  )
}

export const isWalletConnectConnection = (
  maybeWalletConnectConnection: unknown
): maybeWalletConnectConnection is string =>
  isWalletConnectV1Connection(maybeWalletConnectConnection) ||
  isWalletConnectV2Connection(maybeWalletConnectConnection)

export const NEAR_CHAIN_TESTNET = 'near:testnet'

export const NEAR_WALLETCONNECT_CHAIN_META: Record<
  string,
  WalletConnectChainMeta<NearNetworkId, WalletConnectChainStyle.NEAR_LIKE>
> = {
  /* near:testnet */
  [NEAR_CHAIN_TESTNET]: {
    style: WalletConnectChainStyle.NEAR_LIKE,
    chainId: NearNetworkId.TESTNET,
    name: 'NEAR Testnet',
    logo: '/chain-logos/near.png',
    rgb: '99, 125, 234',
    rpc: 'https://rpc.testnet.near.org',
  },
}

export const WALLETCONNECT_SUPPORTED_CHAINS: Record<
  string,
  WalletConnectChainMeta<unknown, WalletConnectChainStyle>
> = {
  ...NEAR_WALLETCONNECT_CHAIN_META,
}
