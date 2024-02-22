import React, { createContext, useCallback, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { fromByteArray } from 'react-native-quick-base64'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import { WitnessIncomingEvent, WitnessOutgoingEvent } from '../constants'
import {
  CalculateWitnessFunction,
  WitnessLogMessage,
  WitnessOutgoingMessageSchema,
  WitnessRequestMessage,
} from '../types'
import { polygonIdLogger as logger, witnessCode } from '../utils'

export type PolygonIdWitnessContextType = {
  isLoading: boolean
  isReady: boolean
  calculateWitness: CalculateWitnessFunction
}

export const PolygonIdWitnessContext =
  createContext<PolygonIdWitnessContextType | null>(null)

export const PolygonIdWitnessProvider: React.FC = (props) => {
  const { children } = props

  // TODO: Optimise communication between the witness and the app
  // - Create a logger for the communication between the webview and the app
  // - Create a ref to store a map for the promises
  // - Create a random id for every execution
  // - Create a Promise for every execution
  // - Store the Promise in the ref map with the id as the key
  // - When receiving the result, resolve the promise with the id

  const webViewRef = useRef<WebView | null>(null)
  const resolveMethodRef = useRef<(result: string) => void>()

  const [isReady, setIsReady] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handleLoadStart = useCallback(() => {
    logger.debug('Polygon ID WebView loading...')
    setIsLoading(true)
  }, [])

  const handleLoaded = useCallback(() => {
    logger.info('Polygon ID WebView loaded')
    setIsLoading(false)
    setIsReady(true)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setIsReady(false)
    // TODO: Get the error from the handler
    logger.error(new Error('Error while loading the Polygon ID WebView'))
  }, [])

  const handleMessage = useCallback(
    ({ nativeEvent: { data } }: WebViewMessageEvent) => {
      logger.debug('Received message from the witness WebView')

      const parsedData = JSON.parse(data)
      const validationResult =
        WitnessOutgoingMessageSchema.safeParse(parsedData)
      if (!validationResult.success) {
        logger.error(
          new Error('Invalid message received from the witness WebView')
        )
        return
      }
      const message = validationResult.data

      switch (message.event) {
        case WitnessOutgoingEvent.RESULT: {
          logger.debug('Received witness execution result')
          if (!resolveMethodRef.current) {
            logger.warn('No resolve method found for the witness result')
            return
          }

          resolveMethodRef.current(message.result)
          break
        }
        case WitnessOutgoingEvent.LOG: {
          logWitnessMessage(message)
          break
        }
        case WitnessOutgoingEvent.ERROR: {
          const cause =
            typeof message.error.message === 'string'
              ? new Error(message.error.message)
              : undefined
          logger.error(
            new Error('Error while executing the witness', { cause })
          )
          break
        }
        default: {
          // Should only happen if the message is valid but handled in the switch cases, hence the 'any' on message as typescript thinks it's never otherwise
          logger.warn('Unhandled message from the witness WebView', {
            event: (message as any).event,
          })
        }
      }
    },
    []
  )

  const calculateWitness: CalculateWitnessFunction = useCallback(
    async (wasm: Uint8Array, inputs: JSON) => {
      logger.info('Calculating witness...')

      if (!webViewRef.current || !isReady) {
        throw new Error('Polygon Id witness not ready')
      }

      const request: WitnessRequestMessage = {
        event: WitnessIncomingEvent.REQUEST,
        binary: fromByteArray(wasm),
        inputs,
      }

      logger.debug('Sending message to the witness WebView')
      webViewRef.current.postMessage(JSON.stringify(request))

      return new Promise<string>((resolve) => {
        resolveMethodRef.current = resolve
      })
    },
    [isReady]
  )

  const contextValue: PolygonIdWitnessContextType = useMemo(
    () => ({
      isReady,
      isLoading,
      calculateWitness,
    }),
    [isReady, isLoading, calculateWitness]
  )

  return (
    <PolygonIdWitnessContext.Provider value={contextValue}>
      <WebView
        ref={webViewRef}
        style={styles.hidden}
        containerStyle={styles.hidden}
        source={{
          html: `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                  </head>
                  <body>
                    <h1>Silver area is a Webview</h1>
                  </body>
                </html>
              `,
        }}
        injectedJavaScriptBeforeContentLoaded={witnessCode}
        onMessage={handleMessage}
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        allowFileAccess
        startInLoadingState={true}
        onLoadStart={handleLoadStart}
        onLoad={handleLoaded}
        onError={handleError}
      />
      {children}
    </PolygonIdWitnessContext.Provider>
  )
}

function logWitnessMessage(log: WitnessLogMessage) {
  switch (log.level) {
    case 'debug':
      logger.debug(`Witness: ${log.message}`, log.data)
      break
    case 'info':
      logger.info(`Witness: ${log.message}`, log.data)
      break
    case 'warn':
      logger.warn(`Witness: ${log.message}`, log.data)
      break
    default:
    // Nothing
  }
}

const styles = StyleSheet.create({
  hidden: {
    display: 'none',
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
})
