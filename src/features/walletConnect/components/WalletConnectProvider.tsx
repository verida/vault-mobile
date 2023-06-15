import {
  isWalletConnectConnection,
  isWalletConnectV1Connection,
  isWalletConnectV2Connection,
  WalletConnectContextProvider,
  WalletConnectContextValue,
} from 'features/walletConnect'
import * as React from 'react'

export const WalletConnectProvider = React.memo(function WalletConnectProvider({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element {
  // TODO: What is the difference between these two functions?
  const onRequestConnect = React.useCallback(
    async (maybeConnectionUri: unknown): Promise<void> => {
      if (!isWalletConnectConnection(maybeConnectionUri))
        throw new Error(
          `Encountered unrecognized connectionUri, "${String(
            maybeConnectionUri
          )}".`
        )

      throw new Error('Not yet implemented!')
    },
    []
  )

  const onHandleConnectionData = React.useCallback(
    async (connectionData: unknown): Promise<void> => {
      if (Math.random() >= 0) throw new Error('Not yet implemented!')

      //// WalletConnect v1
      //// Ex: wc:9145e975-4af0-4a28-a569-19aab7a21dd8@1?bridge=https%3A%2F%2F6.bridge.walletconnect.org&key=40dbb09f0eac060885a0edaf7f1ab7efba207c9b339bc49f805d61b615ac28a7
      //if (data.startsWith('wc:') && data.indexOf('bridge') >= 0) {
      //  navigation.goBack()
      //  handleWalletConnectV1Data(data)
      //  return
      //}

      //// WalletConnect v2
      //// Ex: 'wc:c034ac9bf61c23d3e551663ed8bf973c260130c12f89f22a35a5d1032e3c47af@2?relay-protocol=iridium&symKey=05f034367d195bca2532385b620bd2b2a6c5c62101050bdfe9253e283fe50e12'
      //if (data.startsWith('wc:') && data.indexOf('relay-protocol') >= 0) {
      //  navigation.goBack()
      //  handleWalletConnectV2Data(data)
      //  return
      //}

      // TODO: No longer supported?
      if (isWalletConnectV1Connection(connectionData)) return

      if (isWalletConnectV2Connection(connectionData)) return

      throw new Error("Don't know how to handle connection data!")
    },
    []
  )
  return (
    <WalletConnectContextProvider
      // eslint-disable-next-line react/no-children-prop
      children={children}
      value={React.useMemo<WalletConnectContextValue>(
        () => ({ onRequestConnect, onHandleConnectionData }),
        [onHandleConnectionData, onRequestConnect]
      )}
    />
  )
})
