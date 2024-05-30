import React, { createContext, useCallback, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { fromByteArray } from 'react-native-quick-base64'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import { config } from '~/config'
import { Logger } from '~/features/telemetry'

import { WitnessIncomingEvent, WitnessOutgoingEvent } from '../constants'
import {
  CalculateWitnessFunction,
  HandleWitnessErrorFunction,
  HandleWitnessResultFunction,
  WitnessLogMessage,
  WitnessOutgoingMessageSchema,
  WitnessRequestMessage,
  WitnessResponseHandlers,
} from '../types'
import {
  getWitnessExecutionStaticCode,
  getWitnessExecutionTriggerCode,
} from '../utils'

const logger = Logger.create('PolygonId')

/**
 * This context provides a way to calculate a witness using the Polygon ID library.
 *
 * As the witness calculation requires WebAssembly, it is done in a WebView. This context's provider will create a WebView and handle the communication with it.
 *
 * The static code for calculating the witness is injected in the WebView at launch, then each call to `calculateWitness` will inject the request in the WebView and wait for the result.
 */
export type PolygonIdWitnessContextType = {
  isLoading: boolean
  isReady: boolean
  calculateWitness: CalculateWitnessFunction
}

export const PolygonIdWitnessContext =
  createContext<PolygonIdWitnessContextType | null>(null)

export const PolygonIdWitnessProvider: React.FC = (props) => {
  const { children } = props

  const webViewRef = useRef<WebView | null>(null)

  // This map keeps track of each witness calculation request and how to handle the response
  const witnessResponseHandlers = useRef(
    new Map<string, WitnessResponseHandlers>()
  )

  const [isReady, setIsReady] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handleWebViewLoadStart = useCallback(() => {
    logger.debug('Polygon ID WebView loading...')
    setIsLoading(true)
  }, [])

  const handleWebViewLoaded = useCallback(() => {
    logger.info('Polygon ID WebView loaded')
    setIsLoading(false)
    setIsReady(true)
  }, [])

  const handleWebViewError = useCallback(() => {
    setIsLoading(false)
    setIsReady(false)
    // TODO: Get the error from the handler
    logger.error(new Error('Error while loading the Polygon ID WebView'))
  }, [])

  const handleMessage = useCallback(
    ({ nativeEvent: { data } }: WebViewMessageEvent) => {
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
        case WitnessOutgoingEvent.LOG: {
          logWitnessMessage(message)
          break
        }

        case WitnessOutgoingEvent.RESULT: {
          logger.debug('Received witness execution result')
          const handlers = witnessResponseHandlers.current.get(message.id)

          if (!handlers) {
            // Can happen if the message is received after the timeout, which would have cleared the handlers
            logger.warn('No handler found for the witness result')
            return
          }

          handlers.handleResult(message.result)
          break
        }

        case WitnessOutgoingEvent.ERROR: {
          logger.debug('Received witness execution error')

          const error =
            typeof message.error.message === 'string'
              ? new Error(message.error.message)
              : new Error('Unknown error')
          logger.error(
            new Error('Error while calculating the witness', { cause: error })
          )

          const handlers = message.id
            ? witnessResponseHandlers.current.get(message.id)
            : undefined
          // If no id is provided, the error is not related to a specific request.
          // Can happen if the WebView fails to parse the message and can't get the id, it will throw an error and send it back without an id

          if (!handlers) {
            // Can happen if the message is received after the timeout, which would have cleared the handlers
            logger.warn('No handler found for the witness error')
            return
          }

          handlers.handleError(error)
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
      return new Promise<string>((resolve, reject) => {
        logger.info('Calculating witness...')

        if (!webViewRef.current || !isReady) {
          reject(new Error('Polygon ID witness not ready'))
          return
        }

        // Get an ID to identify the request later on
        const id = Math.random().toString().replace('0.', '')

        // Prepare the request
        const request: WitnessRequestMessage = {
          id,
          event: WitnessIncomingEvent.REQUEST,
          binary: fromByteArray(wasm),
          inputs,
        }

        // Timeout the witness calculation, prevent the promise being stuck unfulfilled in case anything happen in the WebView
        const timeout = setTimeout(() => {
          logger.warn(`Witness calculation timeout`, { id })
          // Clear the handlers
          witnessResponseHandlers.current.delete(id)
          // Reject the promise for the consumer
          reject(new Error('Polygon ID witness calculation timeout'))
        }, config.polygonId.common.witnessCalculationTimeout)

        // Build the response handlers

        const handleResult: HandleWitnessResultFunction = (result) => {
          logger.debug('Handling witness result', { id })
          clearTimeout(timeout)
          witnessResponseHandlers.current.delete(id)
          resolve(result)
        }

        const handleError: HandleWitnessErrorFunction = (error) => {
          logger.warn('Handling witness error', { id })
          clearTimeout(timeout)
          witnessResponseHandlers.current.delete(id)
          reject(error)
        }

        // Store the handlers for the response
        witnessResponseHandlers.current.set(id, {
          handleResult,
          handleError,
          // TODO: Maybe have a clearTimeout to be called in the cleanup function of a useEffect, so that any remaining timeouts are cleared if the component is unmounted
        })

        logger.debug('Preparing message to inject in the witness WebView', {
          id,
        })

        const injectedJavaScript = getWitnessExecutionTriggerCode(
          JSON.stringify(request)
        )

        logger.debug('Injecting message in the witness WebView', { id })
        try {
          // Using injectJavaScript instead of postMessage as it seems deprecated by the WebView library and already doesn't work on Android devices
          webViewRef.current.injectJavaScript(injectedJavaScript)
        } catch (error) {
          logger.error(
            new Error(
              'Error while injecting the message in the witness WebView',
              { cause: error }
            )
          )
        }
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
          // We pass the witness execution code here so it's not overwritten by the `injectJavaScript` when triggerring the witness calculation
          html: `
                <html>
                  <head>
                  </head>
                  <body>
                    <script>
                      ${getWitnessExecutionStaticCode()}
                    </script>
                  </body>
                </html>
              `,
        }}
        onMessage={handleMessage}
        startInLoadingState={true}
        onLoadStart={handleWebViewLoadStart}
        onLoad={handleWebViewLoaded}
        onError={handleWebViewError}
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
