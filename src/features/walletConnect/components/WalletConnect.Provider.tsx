import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { getSdkError } from '@walletconnect/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { ChainId } from 'caip'
import * as React from 'react'
import { Alert } from 'react-native'
import Snackbar from 'react-native-snackbar'
import { useDebouncedCallback } from 'use-debounce'

import {
  getMaybeChainMetadatas,
  useChainMetadatas,
} from '~/features/blockchain'
import {
  minifiedBlockchainAccountsToDropdownOptions,
  useSelectedMinifiedBlockchainAccounts,
} from '~/features/cryptoWallet'
import { Logger } from '~/features/telemetry'
import { useModal } from '~/hooks'
import { useAuth } from '~/hooks/useAuth'
import { MainStackParams } from '~/navigation/types'

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
  useWalletConnectCustomNetworks,
  useWalletConnectSessionRequestCallback,
} from '../hooks'
import {
  ActiveSessions,
  CreatePairingCallback,
  WalletConnectContextValue,
} from '../types'
import { WalletConnectModalConnectDapp } from './WalletConnect.Modal.ConnectDapp'

const logger = Logger.create('WalletConnect')

const DEFAULT_ACTIVE_SESSIONS: ActiveSessions = Object.freeze({})

const walletNotReadyError: Error = new Error(
  'Web3Wallet was not ready to pair.'
)

const tooManyChainsError = () =>
  new Error(
    'The DApp requires several blockchain connections, however only a single is currently supported.'
  )

export const WalletConnectProvider = React.memo(function WalletConnectProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  const [activeSessions, setActiveSessions] = React.useState<ActiveSessions>(
    DEFAULT_ACTIVE_SESSIONS
  )

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const { authenticated } = useAuth()
  const { showModal } = useModal()

  const selectedMinifiedBlockchainAccounts =
    useSelectedMinifiedBlockchainAccounts()

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

  const { maybeAddCustomNetworksOrErrorAsync } =
    useWalletConnectCustomNetworks()

  // Will return true if we will have compatible wallets to render for a
  // given proposal.
  const getMaybeUnsupportedProposalError = React.useCallback(
    async (
      proposal: Web3WalletTypes.EventArguments['session_proposal']
    ): Promise<Error | undefined> => {
      /// @custom:implicit WalletConnectOnlyAcceptsRequiredChains
      const onlyMatchingCaipChainIds =
        getWalletConnectProposalRequiredCaipChainIds(proposal)

      const onlyMatchingNamespaces = onlyMatchingCaipChainIds.map(
        (e) => e.namespace
      )

      const { length: maybeHasCompatibleAccounts } =
        minifiedBlockchainAccountsToDropdownOptions({
          selectedMinifiedBlockchainAccounts,
          onlyMatchingNamespaces,
        })

      if (!maybeHasCompatibleAccounts)
        return new Error(
          'The required chains requested by this dApp are not yet supported.'
        )

      const { length: numberOfRequiredNamespaces } = Object.keys(
        proposal.params.requiredNamespaces
      )

      // HACK: For the case of required namespaces, it is not possible to only
      //       some of all that were requested; this means Verida's current
      //       wallet selection UX, which forces the caller to pick a single
      //       account for a given chainId - is not compatible with multiple
      //       selections.
      //
      //       Attempting to make a partial connection will result in a low
      //       level error, so here we attempt to provide better clarity to
      //       the user.
      // TODO: We need to update WalletConnect.Modal.ConnectDapp to force the
      //       user to make an appropriate selection for ALL required chains,
      //       or they should not be allowed to continue.

      if (numberOfRequiredNamespaces > 1) return tooManyChainsError()

      // HACK: Relies on the fact we know there's only a single namespace.
      /// @custom:implicit WalletConnectOnlyAcceptsRequiredChains
      const [requiredNamespace] = Object.values(
        proposal.params.requiredNamespaces
      )

      const maybeRequiredNamespaceChains = requiredNamespace?.chains

      // We want to enforce connection to only a single chain at a time, since this
      // is all the user can select from the dropdown.
      if (
        Array.isArray(maybeRequiredNamespaceChains) &&
        maybeRequiredNamespaceChains.length > 1
      )
        return tooManyChainsError()

      const requestedNamespaces = onlyMatchingCaipChainIds.map((e) =>
        e.toString()
      ) // i.e. ["eip155:5"]

      const supportedNamespaces = chainMetadatas.map((e) =>
        new ChainId(e).toString()
      )

      // Here, we are filtering out to find the requested chain identifiers that
      // we don't have existing ChainMetadata for. Although the same EIP155 wallet
      // can definitely be used on different chains, our current RPC URL structure
      // demands we know the chain exists a-priori.
      const currentlyUnsupportedChainIds = requestedNamespaces
        .filter((e) => !supportedNamespaces.includes(e))
        .map((e) => new ChainId(e))

      // If the connection has requested unsupported namespaces, we can probe
      // the proposal object to determine whether there is sufficient information to
      // dynamically create the custom namespace, and if so, request the user to
      // create them.
      return maybeAddCustomNetworksOrErrorAsync({
        currentlyUnsupportedChainIds,
        proposal,
      })
    },
    [
      chainMetadatas,
      selectedMinifiedBlockchainAccounts,
      maybeAddCustomNetworksOrErrorAsync,
    ]
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
      logger.error(
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
        async (
          web3wallet: IWeb3Wallet,
          proposal: Web3WalletTypes.EventArguments['session_proposal']
        ) => {
          if (!authenticated)
            return shouldTerminateProposal({
              web3wallet,
              proposal,
              sdkError: 'USER_REJECTED',
            })

          const maybeUnsupportedProposalError =
            await getMaybeUnsupportedProposalError(proposal)

          if (maybeUnsupportedProposalError) {
            Alert.alert(
              'Unable to connect',
              maybeUnsupportedProposalError.message
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
          getMaybeUnsupportedProposalError,
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

  const createPairing: CreatePairingCallback = React.useCallback(() => {
    if (!maybeWeb3Wallet)
      throw new Error('Web3Wallet was not ready to createPairing.')

    const maybePairing = maybeWeb3Wallet?.core?.pairing?.create()

    if (!maybePairing) throw new Error('Unable to create pairing.')

    return maybePairing
  }, [maybeWeb3Wallet])

  const handleQrCodeMessage = React.useCallback(
    async (maybeConnectionUri: unknown): Promise<void> => {
      if (!isWalletConnectConnection(maybeConnectionUri))
        throw new Error(
          `Encountered unrecognized connectionUri, "${String(
            maybeConnectionUri
          )}".`
        )

      try {
        await pairWithWalletConnectUriOrThrow(maybeConnectionUri)
      } catch (error) {
        logger.error(error)

        Alert.alert(
          'Error',
          `Unable to pair${error instanceof Error ? `: ${error.message}` : '.'}`
        )
      } finally {
        navigation.goBack() // Assume this is used from the QR Code scanner screen, so have to close it.
      }
    },
    [pairWithWalletConnectUriOrThrow, navigation]
  )

  // HACK: This function body relies on the side effects of how
  //       onRequestRefreshActiveSessions is reallocated whenever the
  //       maybeWeb3Wallet changes.
  React.useEffect(
    () =>
      // eslint-disable-next-line no-void
      void (async () => {
        try {
          // If there's no Web3Wallet, resort to the DEFAULT_ACTIVE_SESSIONS.
          if (!maybeWeb3Wallet)
            return setActiveSessions(DEFAULT_ACTIVE_SESSIONS)

          await onRequestRefreshActiveSessions()
        } catch (error) {
          logger.error(error)
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
      children={children}
      value={React.useMemo<WalletConnectContextValue>(
        () => ({
          createPairing,
          activeSessions,
          handleQrCodeMessage,
          onRequestRefreshActiveSessions,
          onRequestDeleteSession,
        }),
        [
          createPairing,
          handleQrCodeMessage,
          activeSessions,
          onRequestRefreshActiveSessions,
          onRequestDeleteSession,
        ]
      )}
    />
  )
})
