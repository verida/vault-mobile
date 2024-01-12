import { Web3WalletTypes } from '@walletconnect/web3wallet'

import { veridaWalletMetadata } from '../constants'

const { url, verifyUrl } = veridaWalletMetadata

export const createWalletConnectVerifyContext =
  (): Web3WalletTypes.EventArguments['session_request']['verifyContext'] => {
    return {
      verified: {
        origin: url,
        validation: 'VALID',
        verifyUrl: verifyUrl || url,
      },
    }
  }
