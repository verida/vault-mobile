import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { CryptoWalletRequest } from 'features/cryptoWallet/@types'
import {
  parseCryptoRequestDeepLink,
  parseCryptoRequestQrCode,
} from 'features/cryptoWallet/utils'
import { Logger } from 'features/telemetry'
import React, { createContext, useCallback, useMemo } from 'react'

import { MainStackParams } from 'navigation/types'
import { PaymentRequestScreenParams } from 'pages/Requests'

const logger = new Logger('Crypto Wallet')

export type CryptoWalletContextType = {
  handleDeepLinkUrl: (url: string) => void
  handleQrCodeMessage: (qrCodeMessage: string) => void
  // Extend this interface with other methods if needed, such as for notifications, etc.
}

// TODO: Maybe it should be a BlockchainContext in the 'blockchains' feature

export const CryptoWalletContext =
  createContext<CryptoWalletContextType | null>(null)

export const CryptoWalletProvider: React.FunctionComponent = (props) => {
  const { children } = props

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  const handleRequest = useCallback(
    (request: CryptoWalletRequest, replaceNavigationScreen?: boolean) => {
      logger.debug('Handling request', request)

      const screenParams: PaymentRequestScreenParams = {
        name: request.address,
        details: {
          protocols: [],
          timestamp: new Date().toISOString(),
          requesterId: request.address,
        },
        data: request,
      }

      logger.debug("Navigating to 'PaymentRequest' screen", { screenParams })

      if (replaceNavigationScreen) {
        navigation.replace('PaymentRequest', screenParams)
      } else {
        navigation.navigate('PaymentRequest', screenParams)
      }
    },
    [navigation]
  )

  const handleDeepLinkUrl = useCallback(
    (url: string) => {
      logger.debug('Handling deep link', { url })
      // No try/cath needed, as handled by the consumer
      const request = parseCryptoRequestDeepLink(url)
      handleRequest(request, false)
      // Assuming the deep link doesn't come a particular screen so we don't replace it.
    },
    [handleRequest]
  )

  const handleQrCodeMessage = useCallback(
    (qrCodeMessage: string) => {
      logger.debug('Handling QR Code message', { qrCodeMessage })
      // No try/cath needed, as handled by the consumer
      const request = parseCryptoRequestQrCode(qrCodeMessage)
      try {
        handleRequest(request, true)
      } catch (error: unknown) {
        logger.warn("Couldn't handle QR Code message", { error })
      }
      // Assuming the QR Code comes from the scanner screen, we replace this screen, so when the user is finished with the Polygon ID screen, they go back to the previous screen, not the QR Code scanner screen
    },
    [handleRequest]
  )

  const contextValue: CryptoWalletContextType = useMemo(
    () => ({
      handleDeepLinkUrl,
      handleQrCodeMessage,
    }),
    [handleDeepLinkUrl, handleQrCodeMessage]
  )

  return (
    <CryptoWalletContext.Provider value={contextValue}>
      {children}
    </CryptoWalletContext.Provider>
  )
}
