import {
  ETH_STANDARD_PATH,
  MAINNET_CHAIN_ID,
  SUPPORTED_CHAINS,
} from '../constants'
import { getRpcEngine } from '../engines'
import { WalletConnectConfig } from '../types'

const walletConnectConfig: WalletConnectConfig = {
  name: 'WalletConnect',
  logo: require('assets/walletconnect-logo.png'),
  chainId: MAINNET_CHAIN_ID,
  derivationPath: ETH_STANDARD_PATH,
  chains: SUPPORTED_CHAINS,
  styleOpts: {
    showPasteUri: true,
    showVersion: true,
  },
  rpcEngine: getRpcEngine(),
  events: {
    init: () => Promise.resolve(),
    update: () => Promise.resolve(),
  },
}

export function getWalletConnectConfig(): WalletConnectConfig {
  return walletConnectConfig
}
