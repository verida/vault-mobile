import * as Sentry from '@sentry/react-native'
import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { useModal } from 'hooks'
import * as React from 'react'
import { Alert } from 'react-native'

import { ActiveSessions, WalletConnectContextValue } from '../@types'
import {
  isWalletConnectConnection,
  isWalletConnectV2Connection,
} from '../constants'
import { WalletConnectContextProvider } from '../contexts'
import {
  getMaybeWalletConnectActiveSessionByKey,
  useCreateWeb3Wallet,
  useMaybeWeb3Wallet,
  useWalletConnectSessionRequestCallback,
} from '../hooks'
import { WalletConnectModalConnectDapp } from './WalletConnect.Modal.ConnectDapp'

const DEFAULT_ACTIVE_SESSIONS: ActiveSessions = Object.freeze({})

const walletNotReadyError: Error = new Error(
  'Web3Wallet was not ready to pair.'
)

export const WalletConnectProvider = React.memo(function WalletConnectProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  const [activeSessions, setActiveSessions] = React.useState<ActiveSessions>(
    DEFAULT_ACTIVE_SESSIONS
  )
  const { showModal } = useModal()

  const maybeWeb3Wallet = useMaybeWeb3Wallet(
    useCreateWeb3Wallet({
      onSessionRequest: useWalletConnectSessionRequestCallback(),
      onSessionProposal: React.useCallback(
        (
          web3wallet: IWeb3Wallet,
          proposal: Web3WalletTypes.EventArguments['session_proposal']
        ) =>
          showModal(
            <WalletConnectModalConnectDapp
              setActiveSessions={setActiveSessions}
              proposal={proposal}
              web3wallet={web3wallet}
            />
          ),
        [showModal]
      ),
      onSessionDelete: React.useCallback(async (web3wallet) => {
        // TODO: Add tracking?
        // TODO: Notify user? Snackbar would be nice.
        // eslint-disable-next-line no-console
        __DEV__ && console.warn('Session deleted!')

        setActiveSessions(await web3wallet.getActiveSessions())
      }, []),
    })
  )

  const onRequestRefreshActiveSessions = React.useCallback(async () => {
    if (!maybeWeb3Wallet) throw walletNotReadyError

    const nextActiveSessions: ActiveSessions =
      await maybeWeb3Wallet.getActiveSessions()

    setActiveSessions(nextActiveSessions)
  }, [maybeWeb3Wallet])

  const pairWithWalletConnectUriOrThrow = React.useCallback(
    async (connectionUri: string) => {
      if (!maybeWeb3Wallet) throw walletNotReadyError

      if (!isWalletConnectV2Connection(connectionUri))
        throw new Error('Expected v2 connectionUri.')

      await maybeWeb3Wallet.core.pairing.pair({ uri: connectionUri })
    },
    [maybeWeb3Wallet]
  )

  const onRequestConnect = React.useCallback(
    async (maybeConnectionUri: unknown): Promise<void> => {
      if (!isWalletConnectConnection(maybeConnectionUri))
        throw new Error(
          `Encountered unrecognized connectionUri, "${String(
            maybeConnectionUri
          )}".`
        )

      try {
        await pairWithWalletConnectUriOrThrow(maybeConnectionUri)
      } catch (e) {
        Sentry.captureException(e)

        Alert.alert(
          'Error',
          `Unable to pair${e instanceof Error ? `: ${e.message}` : '.'}`
        )
      }
    },
    [pairWithWalletConnectUriOrThrow]
  )

  // HACK: This function body relies on the side effects of how
  //       onRequestRefreshActiveSessions is reallocated whenever the
  //       maybeWeb3Wallet changes.
  React.useEffect(
    () =>
      void (async () => {
        try {
          // If there's no Web3Wallet, resort to the DEFAULT_ACTIVE_SESSIONS.
          if (!maybeWeb3Wallet)
            return setActiveSessions(DEFAULT_ACTIVE_SESSIONS)

          await onRequestRefreshActiveSessions()
        } catch (e) {
          // eslint-disable-next-line no-console
          __DEV__ && console.error(e)

          Sentry.captureException(e)
        }
      })(),
    [onRequestRefreshActiveSessions, maybeWeb3Wallet]
  )

  const onRequestDeleteSession = React.useCallback(
    async (
      walletConnectSessionKey: string,
      reason: ErrorResponse
    ): Promise<void> => {
      if (!maybeWeb3Wallet) throw walletNotReadyError

      const maybeActiveSession = getMaybeWalletConnectActiveSessionByKey({
        activeSessions,
        walletConnectSessionKey,
      })

      if (!maybeActiveSession)
        throw new Error(
          `Unable to delete session "${walletConnectSessionKey}". Session not found.`
        )

      const { topic } = maybeActiveSession

      await maybeWeb3Wallet.disconnectSession({ topic, reason })

      // TODO: Check whether this is required (we might be double-refreshing is maybeWeb3Wallet is reallocated)
      await onRequestRefreshActiveSessions()
    },
    [onRequestRefreshActiveSessions, maybeWeb3Wallet, activeSessions]
  )

  return (
    <WalletConnectContextProvider
      // eslint-disable-next-line react/no-children-prop
      children={children}
      value={React.useMemo<WalletConnectContextValue>(
        () => ({
          activeSessions,
          onRequestConnect,
          onRequestRefreshActiveSessions,
          onRequestDeleteSession,
        }),
        [
          onRequestConnect,
          activeSessions,
          onRequestRefreshActiveSessions,
          onRequestDeleteSession,
        ]
      )}
    />
  )
})
