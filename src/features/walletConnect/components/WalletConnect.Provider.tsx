import * as Sentry from '@sentry/react-native'
import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { getSdkError } from '@walletconnect/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/caip'
import {
  useMaybeSelectedWallet,
  veridaWalletAccountsToDropdownOptions,
} from 'features/cryptoWallet'
import { useModal } from 'hooks'
import * as React from 'react'
import { Alert } from 'react-native'
import Snackbar from 'react-native-snackbar'
import { useDebouncedCallback } from 'use-debounce'

import { useAuth } from 'hooks/useAuth'

import { ActiveSessions, WalletConnectContextValue } from '../@types'
import {
  isWalletConnectConnection,
  isWalletConnectV2Connection,
} from '../constants'
import { WalletConnectContextProvider } from '../contexts'
import {
  getMaybeWalletConnectActiveSessionByKey,
  getWalletConnectProposalRequiredCaipChainIds,
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

  const { authenticated } = useAuth()
  const { showModal } = useModal()

  const maybeVeridaWalletAccounts = useMaybeSelectedWallet()?.accounts
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const debouncedSnackbar = useDebouncedCallback(
    React.useCallback(
      (text: string) =>
        Snackbar.show({
          text,
          duration: Snackbar.LENGTH_LONG,
        }),
      []
    ),
    120
  )

  // Will return true if we will have compatible wallets to render for a
  // given proposal.
  const isSessionProposalSupported = React.useCallback(
    (proposal: Web3WalletTypes.EventArguments['session_proposal']) => {
      const onlyMatchingCaipChainIds =
        getWalletConnectProposalRequiredCaipChainIds(proposal)

      const { length: maybeHasCompatibleAccounts } =
        veridaWalletAccountsToDropdownOptions({
          chainMetadatas,
          maybeVeridaWalletAccounts,
          onlyMatchingCaipChainIds,
          includesWatchedWallets: false,
        })

      return Boolean(maybeHasCompatibleAccounts)
    },
    [maybeVeridaWalletAccounts, chainMetadatas]
  )

  const shouldTerminateProposal = React.useCallback(
    ({
      web3wallet,
      proposal,
      sdkError,
    }: {
      readonly web3wallet: IWeb3Wallet
      readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
      readonly sdkError: Parameters<typeof getSdkError>[0]
    }) => {
      Sentry.captureException(
        new Error(`WalletConnect proposal terminated. (${sdkError})`)
      )
      return web3wallet.rejectSession({
        id: proposal.id,
        reason: getSdkError(sdkError),
      })
    },
    []
  )

  const maybeWeb3Wallet = useMaybeWeb3Wallet(
    useCreateWeb3Wallet({
      onSessionRequest: useWalletConnectSessionRequestCallback(),
      onSessionProposal: React.useCallback(
        (
          web3wallet: IWeb3Wallet,
          proposal: Web3WalletTypes.EventArguments['session_proposal']
        ) => {
          if (!authenticated)
            return shouldTerminateProposal({
              web3wallet,
              proposal,
              sdkError: 'USER_REJECTED',
            })

          if (!isSessionProposalSupported(proposal)) {
            Alert.alert(
              'Unable to connect',
              `The required chains requested by this dApp are not yet supported.`
            )

            return shouldTerminateProposal({
              web3wallet,
              proposal,
              sdkError: 'UNSUPPORTED_ACCOUNTS',
            })
          }

          // Check if there are caip typed.
          return showModal(
            <WalletConnectModalConnectDapp
              setActiveSessions={setActiveSessions}
              proposal={proposal}
              web3wallet={web3wallet}
            />
          )
        },
        [
          authenticated,
          isSessionProposalSupported,
          shouldTerminateProposal,
          showModal,
        ]
      ),
      onSessionDelete: React.useCallback(
        async (web3wallet) => {
          debouncedSnackbar('Session disconnected')
          setActiveSessions(await web3wallet.getActiveSessions())
        },
        [debouncedSnackbar]
      ),
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
