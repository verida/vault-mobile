import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/blockchain'
import { CryptoWalletRawRequest } from 'features/cryptoWallet/@types'
import {
  parseCryptoRequestDeepLink,
  parseCryptoRequestQrCode,
  processCryptoRequest,
} from 'features/cryptoWallet/utils'
import React, { createContext, useCallback, useMemo } from 'react'

import { MainStackParams } from 'navigation/types'
import { PaymentRequestScreenParams } from 'pages/Requests'

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

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const handleRequest = useCallback(
    (request: CryptoWalletRawRequest, replaceNavigationScreen?: boolean) => {
      const processedRequest = processCryptoRequest({ request, chainMetadatas })

      switch (request.action) {
        case 'pay':
          const screenParams: PaymentRequestScreenParams = {
            name: request.address,
            details: {
              protocols: ['blockchain'],
              timestamp: new Date().toISOString(),
              requesterId: request.address,
              message: request.params?.message
                ? String(request.params?.message)
                : undefined,
            },
            data: processedRequest,
          }

          if (replaceNavigationScreen) {
            navigation.replace('PaymentRequest', screenParams)
          } else {
            navigation.navigate('PaymentRequest', screenParams)
          }
          break
        default:
          // TODO: Should display an Alert?
          throw new Error(
            `Unsupported crypto wallet request action: ${request.action}`
          )
      }
    },
    [navigation, chainMetadatas]
  )

  const handleDeepLinkUrl = useCallback(
    (url: string) => {
      // No try/cath needed, as handled by the consumer
      const request = parseCryptoRequestDeepLink(url)
      handleRequest(request, false)
      // Assuming the deep link doesn't come a particular screen so we don't replace it.
    },
    [handleRequest]
  )

  const handleQrCodeMessage = useCallback(
    (qrCodeMessage: string) => {
      // No try/cath needed, as handled by the consumer
      const request = parseCryptoRequestQrCode(qrCodeMessage)
      handleRequest(request, true)
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
