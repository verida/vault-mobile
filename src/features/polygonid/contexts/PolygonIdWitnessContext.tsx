import React, { createContext, useCallback, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { fromByteArray } from 'react-native-quick-base64'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import { WitnessCalculatorFunction } from '../types'
import { polygonIdLogger as logger, witnessCode } from '../utils'

export type PolygonIdWitnessContextType = {
  isLoading: boolean
  isReady: boolean
  witnessCalculator: WitnessCalculatorFunction
}

export const PolygonIdWitnessContext =
  createContext<PolygonIdWitnessContextType | null>(null)

export const PolygonIdWitnessProvider: React.FC = (props) => {
  const { children } = props

  const webViewRef = useRef<WebView | null>(null)
  const resolveMethodRef = useRef<(result: string) => void>()

  const [isReady, setIsReady] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handleLoadStart = useCallback(() => {
    logger.info('Polygon ID WebView loading...')
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
    ({ nativeEvent: { data: maybeData } }: WebViewMessageEvent) => {
      const data = JSON.parse(maybeData)
      if (!resolveMethodRef.current) {
        return
      }
      if (data.event === '@EXECUTION_RESULT') {
        // TODO: Move to constants
        resolveMethodRef.current(data.witnessCalculationResult)
      }
    },
    []
  )

  const witnessCalculator = useCallback(
    async (wasm: Uint8Array, data: JSON) => {
      if (!webViewRef.current || !isReady) {
        throw new Error('Polygon Id witness not ready')
      }

      webViewRef.current?.postMessage(
        JSON.stringify({
          event: '@EXECUTE_WASM', // TODO: Move to constants
          binary: fromByteArray(wasm),
          data,
        })
      )

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
      witnessCalculator,
    }),
    [isReady, isLoading, witnessCalculator]
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

const styles = StyleSheet.create({
  hidden: {
    display: 'none',
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
})
