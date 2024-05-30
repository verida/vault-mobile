import React, { createContext, useCallback, useMemo } from 'react'

import { useProtocolHandlers } from '~/features/protocols/hooks'
import { Logger } from '~/features/telemetry'

const logger = Logger.create('ProtocolsContext')

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
      logger.info('Processing deep link')
      logger.debug('Deep link', { uri })
      // Iterate over the handlers, return true if one of them handled the deep link, false otherwise
      // TODO: Change the handler to async and refactor this code as some protocol handlers might be async
      const wasHandled = protocolHandlers.current.some((handler) => {
        try {
          // The handler will return true if it handled the deep link, false otherwise
          // A handler is considered synchronous, refactor if needed
          return handler.handleDeepLink(uri)
        } catch (cause: unknown) {
          const error = new Error('Protocol failed to handle deep link', {
            cause,
          }) // TODO: Check if ne sensitive info leaked here
          logger.error(error)
          // Return false to indicate that the deep link was not handled
          return false
        }
      })

      // TODO: This should be a dedicated protocol handler
      //       For now, we just migrate existing usage.

      if (wasHandled) {
        logger.info('The deep link was processed')
      } else {
        logger.warn(
          'The deep link was not processed by the protocol handlers',
          { deepLink: uri } // TODO: Check if ne sensitive info leaked here
        )
      }

      return wasHandled
    },
    [protocolHandlers]
  )

  const processQrCode = useCallback(
    (qrCodeMessage: string) => {
      logger.info('Processing QR Code message')
      logger.debug('QR code message', { qrCodeMessage })
      // Iterate over the handlers, return true if one of them handled the QR code, false otherwise
      const wasHandled = protocolHandlers.current.some((handler) => {
        try {
          // The handler will return true if it handled the QR code, false otherwise
          // A handler is considered synchronous, refactor if needed
          return handler.handleQrCode(qrCodeMessage)
        } catch (cause: unknown) {
          const error = new Error('Protocol failed to handle QR code message', {
            cause,
          }) // TODO: Check if ne sensitive info leaked here
          logger.error(error)
          // Return false to indicate that the QR code was not handled
          return false
        }
      })

      if (wasHandled) {
        logger.info('The QR code was processed')
      } else {
        logger.warn('The QR code was not processed by the protocol handlers', {
          qrCodeMessage, // TODO: Check if ne sensitive info leaked here
        })
      }

      return wasHandled
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
