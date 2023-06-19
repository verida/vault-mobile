import * as Sentry from '@sentry/react-native'
import {
  isWalletConnectConnection,
  isWalletConnectV2Connection,
  useCreateWeb3Wallet,
  useMaybeWeb3Wallet,
  WalletConnectContextProvider,
  WalletConnectContextValue,
} from 'features/walletConnect'
import * as React from 'react'
import { Alert } from 'react-native'

export const WalletConnectProvider = React.memo(function WalletConnectProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  const maybeWeb3Wallet = useMaybeWeb3Wallet(
    useCreateWeb3Wallet({
      onSessionRequest: React.useCallback(() => undefined, []),
      onSessionProposal: React.useCallback(() => undefined, []),
      onSessionDelete: React.useCallback(() => undefined, []),
    })
  )

  const pairWithWalletConnectUriOrThrow = React.useCallback(
    (connectionUri: string) => {
      if (!maybeWeb3Wallet) throw new Error('Web3Wallet was not ready to pair.')

      if (!isWalletConnectV2Connection(connectionUri))
        throw new Error('Expected v2 connectionUri.')

      return maybeWeb3Wallet.core.pairing.pair({ uri: connectionUri })
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

        // eslint-disable-next-line no-console
        __DEV__ && console.warn('Successfully paired.')
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

  return (
    <WalletConnectContextProvider
      // eslint-disable-next-line react/no-children-prop
      children={children}
      value={React.useMemo<WalletConnectContextValue>(
        () => ({
          onRequestConnect,
          maybeWeb3Wallet: maybeWeb3Wallet ?? undefined,
        }),
        [onRequestConnect, maybeWeb3Wallet]
      )}
    />
  )
})
