import {
  ETH_STANDARD_PATH,
  MAINNET_CHAIN_ID,
  SUPPORTED_CHAINS,
} from '../constants'
import { getRpcEngine } from '../engines'
import { IAppConfig } from '../helpers/types'
import walletconnectLogo from './assets/walletconnect-logo.png'

const appConfig: IAppConfig = {
  name: 'WalletConnect',
  logo: walletconnectLogo,
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
    init: (state) => Promise.resolve(),
    update: (state) => Promise.resolve(),
  },
}

export function getAppConfig(): IAppConfig {
  return appConfig
}
