import {
  ETH_STANDARD_PATH,
  MAINNET_CHAIN_ID,
  SUPPORTED_CHAINS,
} from '../constants'
import { getRpcEngine } from '../engines'
import { WalletConnectConfig } from '../types'

const appConfig: WalletConnectConfig = {
  name: 'WalletConnect',
  logo: require('assets/walletconnect-logo.png'),
  chainId: MAINNET_CHAIN_ID,
  derivationPath: ETH_STANDARD_PATH,
  numberOfAccounts: 3,
  colors: {
    defaultColor: '12, 12, 13',
    backgroundColor: '40, 44, 52',
  },
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

export function getAppConfig(): WalletConnectConfig {
  return appConfig
}
