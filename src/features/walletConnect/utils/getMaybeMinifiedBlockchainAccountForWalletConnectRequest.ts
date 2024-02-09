import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import {
  MinifiedBlockchainAccount,
  MinifiedBlockchainAccounts,
} from 'features/cryptoWallet'

import { ActiveSession, ActiveSessions } from '../@types'
import { getMaybeMinifiedBlockchainAccountForWalletConnectActiveSession } from './getMaybeMinifiedBlockchainAccountForWalletConnectActiveSession'

export function getMaybeMinifiedBlockchainAccountForWalletConnectRequest({
  web3wallet,
  request,
  minifiedBlockchainAccounts,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly minifiedBlockchainAccounts: MinifiedBlockchainAccounts
}): MinifiedBlockchainAccount | undefined {
  const activeSessions: ActiveSessions = web3wallet.getActiveSessions()

  const maybeActiveSession: ActiveSession = activeSessions?.[request.topic]

  if (!maybeActiveSession) return undefined

  return getMaybeMinifiedBlockchainAccountForWalletConnectActiveSession({
    activeSession: maybeActiveSession,
    request,
    minifiedBlockchainAccounts,
  })
}

export function getMinifiedBlockchainAccountForWalletConnectRequestOrThrow({
  web3wallet,
  request,
  minifiedBlockchainAccounts,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly minifiedBlockchainAccounts: MinifiedBlockchainAccounts
}) {
  const maybeWallet = getMaybeMinifiedBlockchainAccountForWalletConnectRequest({
    web3wallet,
    request,
    minifiedBlockchainAccounts,
  })

  if (!maybeWallet)
    throw new Error(
      `Unable to find ethereum wallet for topic "${request.topic}".`
    )

  return maybeWallet
}
