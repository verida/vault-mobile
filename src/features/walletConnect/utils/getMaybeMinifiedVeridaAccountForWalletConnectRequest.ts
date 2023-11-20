import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import {
  MinifiedVeridaAccount,
  MinifiedVeridaAccounts,
} from 'features/cryptoWallet'

import { ActiveSession, ActiveSessions } from '../@types'
import { getMaybeMinifiedVeridaAccountForWalletConnectActiveSession } from './getMaybeMinifiedVeridaAccountForWalletConnectActiveSession'

export function getMaybeMinifiedVeridaAccountForWalletConnectRequest({
  web3wallet,
  request,
  minifiedVeridaAccounts,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly minifiedVeridaAccounts: MinifiedVeridaAccounts
}): MinifiedVeridaAccount | undefined {
  const activeSessions: ActiveSessions = web3wallet.getActiveSessions()

  const maybeActiveSession: ActiveSession = activeSessions?.[request.topic]

  if (!maybeActiveSession) return undefined

  return getMaybeMinifiedVeridaAccountForWalletConnectActiveSession({
    activeSession: maybeActiveSession,
    request,
    minifiedVeridaAccounts,
  })
}

export function getMinifiedVeridaAccountForWalletConnectRequestOrThrow({
  web3wallet,
  request,
  minifiedVeridaAccounts,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly minifiedVeridaAccounts: MinifiedVeridaAccounts
}) {
  const maybeWallet = getMaybeMinifiedVeridaAccountForWalletConnectRequest({
    web3wallet,
    request,
    minifiedVeridaAccounts,
  })

  if (!maybeWallet)
    throw new Error(
      `Unable to find ethereum wallet for topic "${request.topic}".`
    )

  return maybeWallet
}
