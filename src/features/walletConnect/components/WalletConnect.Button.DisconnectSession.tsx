import Sentry from '@sentry/react-native'
import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { getSdkError } from '@walletconnect/utils'
import { useWalletConnectContext } from 'features/walletConnect'
import * as React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import Button from 'components/Button'

const defaultReason: ErrorResponse = getSdkError('USER_DISCONNECTED')

export const WalletConnectButtonDisconnectSession = React.memo(
  function WalletConnectButtonDisconnectSession({
    style,
    walletConnectSessionKey,
    reason = defaultReason,
  }: {
    readonly style?: StyleProp<ViewStyle>
    readonly walletConnectSessionKey: string
    readonly reason?: ErrorResponse
  }): JSX.Element {
    const { onRequestDeleteSession } = useWalletConnectContext()
    const [loading, setLoading] = React.useState<boolean>(false)
    return (
      <Button
        style={style}
        color='transparent-warning'
        disabled={loading}
        loading={loading}
        onPress={React.useCallback(async () => {
          try {
            setLoading(true)

            await onRequestDeleteSession(
              walletConnectSessionKey,
              reason || defaultReason
            )
          } catch (e) {
            // eslint-disable-next-line no-console
            __DEV__ && console.error(e)

            Sentry.captureException(e)
          } finally {
            setLoading(false)
          }
        }, [walletConnectSessionKey, reason, onRequestDeleteSession])}>
        Disconnect
      </Button>
    )
  }
)
