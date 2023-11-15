import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { getSdkError } from '@walletconnect/utils'
import { Logger } from 'features/telemetry'
import * as React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import Button from 'components/Button'

import { useWalletConnectContext } from '../contexts'

const logger = new Logger('WalletConnect')

const defaultReason: ErrorResponse = getSdkError('USER_DISCONNECTED')

export const WalletConnectButtonDisconnectSession = React.memo(
  function WalletConnectButtonDisconnectSession({
    style,
    walletConnectSessionKey,
    reason = defaultReason,
    onSessionDeleted: maybeOnSessionDeleted,
  }: {
    readonly style?: StyleProp<ViewStyle>
    readonly walletConnectSessionKey: string
    readonly reason?: ErrorResponse
    readonly onSessionDeleted?: () => void
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

            maybeOnSessionDeleted?.()
          } catch (error: unknown) {
            logger.error(error)
          } finally {
            setLoading(false)
          }
        }, [
          walletConnectSessionKey,
          reason,
          onRequestDeleteSession,
          maybeOnSessionDeleted,
        ])}>
        Disconnect
      </Button>
    )
  }
)
