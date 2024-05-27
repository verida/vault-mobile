import { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'

import { Protocol } from '~/features/protocols'

export type Web3WalletData = {
  web3wallet: IWeb3Wallet
  proposal: Web3WalletTypes.EventArguments['session_proposal']
}

export interface ConnectionRequestScreenParams {
  name: string // TODO: Make it optional and provide a consistent way to representing an unknown requester
  logo?: string
  details: {
    timestamp?: string
    requesterId: string
    message?: string
    url?: string
    protocols: Protocol[]
  }
  data: AuthorizationRequestMessage | Web3WalletData
  // TODO: Make it multiple types for the different protocols
  // TODO: Add expiry when needed
}
