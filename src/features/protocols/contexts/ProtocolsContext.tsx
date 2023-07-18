import * as Sentry from '@sentry/react-native'
import { useProtocolHandlers } from 'features/protocols/hooks'
import React, { createContext, useCallback, useMemo } from 'react'

export type ProtocolsContextType = {
  processDeepLink: (url: string) => boolean
  processQrCode: (qrCodeMessage: string) => boolean
  // Extend this interface with other methods if needed, such as for notifications, etc.
}

export const ProtocolsContext = createContext<ProtocolsContextType | null>(null)

export const ProtocolsProvider: React.FunctionComponent = (props) => {
  const { children } = props

  const protocolHandlers = useProtocolHandlers()

  const processDeepLink = useCallback(
    (uri: string) => {
      // Iterate over the handlers, return true if one of them handled the deep link, false otherwise
      return protocolHandlers.current.some((handler) => {
        try {
          // The handler will return true if it handled the deep link, false otherwise
          // A handler is considered synchronous, refactor if needed
          return handler.handleDeepLink(uri)
        } catch (error: unknown) {
          Sentry.captureException(error)
          // Return false to indicate that the deep link was not handled
          return false
        }
      })
    },
    [protocolHandlers]
  )

  const processQrCode = useCallback(
    (qrCodeMessage: string) => {
      // Iterate over the handlers, return true if one of them handled the QR code, false otherwise
      return protocolHandlers.current.some((handler) => {
        try {
          // The handler will return true if it handled the QR code, false otherwise
          // A handler is considered synchronous, refactor if needed
          return handler.handleQrCode(qrCodeMessage)
        } catch (error: unknown) {
          Sentry.captureException(error)
          // Return false to indicate that the QR code was not handled
          return false
        }
      })
    },
    [protocolHandlers]
  )

  const contextValue: ProtocolsContextType = useMemo(
    () => ({
      processDeepLink,
      processQrCode,
    }),
    [processDeepLink, processQrCode]
  )

  return (
    <ProtocolsContext.Provider value={contextValue}>
      {children}
    </ProtocolsContext.Provider>
  )
}
