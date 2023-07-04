import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { useWalletsData } from 'hooks'
import { VeridaWalletAccount } from 'types'

import { ActiveSession, ActiveSessions } from '../@types'
import { getMaybeVeridaWalletAccountForWalletConnectActiveSession } from './getMaybeVeridaWalletAccountForWalletConnectActiveSession'

export function getMaybeVeridaWalletAccountForWalletConnectRequest({
  web3wallet,

  request,
  walletsData,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}): VeridaWalletAccount | undefined {
  const activeSessions: ActiveSessions = web3wallet.getActiveSessions()

  const maybeActiveSession: ActiveSession = activeSessions?.[request.topic]

  if (!maybeActiveSession) return undefined

  return getMaybeVeridaWalletAccountForWalletConnectActiveSession({
    activeSession: maybeActiveSession,
    walletsData,
  })
}

// TODO: @cawfree this isn't anything specific to ethereum, refactor for near
export function getVeridaWalletAccountForWalletConnectRequestOrThrow({
  web3wallet,
  request,
  walletsData,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}) {
  const maybeWallet = getMaybeVeridaWalletAccountForWalletConnectRequest({
    web3wallet,
    request,
    walletsData,
  })

  if (!maybeWallet)
    throw new Error(
      `Unable to find ethereum wallet for topic "${request.topic}".`
    )

  return maybeWallet
}
