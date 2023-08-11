import type {
  AuthorizationResponseMessage,
  CircuitId,
  W3CCredential,
} from '@0xpolygonid/js-sdk'
import { Logger, Sentry } from 'features/telemetry'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import { useEnsureCircuitsDownloaded } from '../../circuit'
import {
  PolygonContextValue,
  PolygonCreateIdManager,
  PolygonHandleAuthorizationRequest,
  PolygonHandleCredentialsOffer,
  PolygonIdManagerConfig,
  PolygonPromiseCallbacks,
  PolygonWebViewCallbackProps,
  RandomKeyGenerator,
} from '../@types'
import { PolygonContextProvider } from '../contexts'

const logger = new Logger('Polygon ID')

const defaultGenerateRandomKey: RandomKeyGenerator = () => String(Math.random())

const originWhitelist = ['*']

type WebappLogMessage = {
  type: 'log'
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: Record<string, unknown>
}

export const PolygonProvider = ({
  generateRandomKey = defaultGenerateRandomKey, // TODO: use nanoid(), uuid(), etc.,
  children,
  uri,
  isServerReady,
  requiredCircuitIds /* CircuitIds which must exist before attempting to mount the WebView. */,
}: React.PropsWithChildren<{
  readonly generateRandomKey?: RandomKeyGenerator
  readonly uri: string
  readonly isServerReady: boolean
  readonly requiredCircuitIds: readonly `${CircuitId}`[]
}>): JSX.Element => {
  const ref = React.useRef<WebView | null>(null)

  // Ensure the circuits are downloaded.
  const isCircuitsDownloaded = useEnsureCircuitsDownloaded(requiredCircuitIds)

  const isRequiredCircuitsDownloaded =
    'result' in isCircuitsDownloaded && isCircuitsDownloaded.result

  const [webPageLoaded, setWebPageLoaded] = React.useState<boolean>(false)
  // TODO: Re-enable the loading indicator, so it can be used by the UI to indicate that the Polygon ID 'engine' is loading
  // const [webPageLoading, setWebPageLoading] = React.useState<boolean>(true)

  const polygonPromiseCallbacks = React.useRef<PolygonPromiseCallbacks>({})

  const onMessage = React.useCallback(
    ({ nativeEvent: { data: maybeResult } }: WebViewMessageEvent) => {
      try {
        const result = JSON.parse(maybeResult)

        if (!result || typeof result !== 'object') {
          throw new Error(
            `Expected object result from Polygon ID web app, encountered ${typeof result}.`
          )
        }

        if ('type' in result && result.type === 'log') {
          logWebappMessage(result as WebappLogMessage)
          return
        }

        const maybePolygonResult = result as PolygonWebViewCallbackProps

        const { taskId } = maybePolygonResult

        if (typeof taskId !== 'string' || !taskId.length)
          throw new Error(
            `Expected non-empty string taskId from Polygon ID web app, encountered "${String(
              taskId
            )}".`
          )

        const { [taskId]: maybeCallback } = polygonPromiseCallbacks.current

        if (!maybeCallback)
          throw new Error(
            `Encountered callback asynchrony for Polygon ID web app; there was no taskId with signalling value "${taskId}" detected.`
          )

        // Clear this task; we have now latched the value within the scope of callback.
        delete polygonPromiseCallbacks.current[taskId]

        if ('error' in maybePolygonResult) {
          const { error } = maybePolygonResult
          logger.warn(
            'Received Polygon ID web app message with an error result',
            maybePolygonResult
          )
          return maybeCallback.reject(
            new Error('Failed to resolved Polygon ID task', { cause: error })
          )
        }

        if ('result' in maybePolygonResult) {
          logger.info('Received Polygon ID web app message with a success')
          const { result: promiseResult } = maybePolygonResult
          return maybeCallback.resolve(promiseResult)
        }

        throw new Error(
          `Encountered malformed message from Polygon ID web app: "${maybeResult}"`
        )
      } catch (error: unknown) {
        logger.warn(
          'Failed to handle received message from the Polygon ID web app'
        )
        Sentry.captureException(error)
      }
    },
    []
  )

  const onLoadStart = React.useCallback(() => {
    logger.info('Polygon ID WebView loading...')
    // setWebPageLoading(true)
  }, [])

  const onLoad = React.useCallback(() => {
    logger.info('Polygon ID WebView loaded')
    // setWebPageLoading(false)
    setWebPageLoaded(true)
  }, [])

  const handleError = React.useCallback(() => {
    setWebPageLoaded(false)
    // TODO: Get the error from the handler
    logger.error('Error while loading the Polygon ID WebView')
    Sentry.captureException(
      new Error('Error while loading the Polygon ID WebView')
    )
  }, [])

  // Mark the PolygonProvider as ready if all the required conditions are met.
  const isReady = webPageLoaded && isRequiredCircuitsDownloaded && isServerReady

  React.useEffect(() => {
    if (!isServerReady) {
      setWebPageLoaded(false)
    }
  }, [isServerReady])

  const invokeJs = React.useCallback(
    ({
      js,
      taskId = generateRandomKey(),
    }: {
      readonly js: string
      readonly taskId?: string
    }) => {
      return new Promise<unknown>((resolve, reject) => {
        if (!isReady) {
          return reject(new Error('Polygon ID engine is not ready'))
        }

        Object.assign(polygonPromiseCallbacks.current, {
          [taskId]: { resolve, reject },
        })

        const injectedJavaScript = `void (window.__HANDLE_PROMISE_TASK__({taskId: ${JSON.stringify(
          taskId
        )}, promise: ${js} }))`

        logger.info(`Passing task to Polygon ID web app`, { taskId })
        logger.debug('Injecting JavaScript in Polygon ID WebView')

        try {
          return ref.current?.injectJavaScript(injectedJavaScript)
        } catch (error: unknown) {
          logger.warn('Error while injecting JavaScript in WebView')
          Sentry.captureException(error)
        }
      })
    },
    [ref, generateRandomKey, isReady]
  )

  const createIdManager: PolygonCreateIdManager = React.useCallback(
    async (config: PolygonIdManagerConfig) => {
      logger.info('Creating a Polygon ID Manager in the web app')

      const managerId = await invokeJs({
        js: `window.__CREATE_POLYGON_ID_MANAGER__({managerId: ${JSON.stringify(
          generateRandomKey()
        )}, config: ${JSON.stringify(config)}})`,
      })

      if (typeof managerId !== 'string' || !managerId.length) {
        throw new Error(
          `Expected non-empty string managerId, encountered "${String(
            managerId
          )}"`
        )
      }

      logger.info(`Polygon ID Manager created: ${managerId}`)
      return managerId
    },
    [invokeJs, generateRandomKey]
  )

  const handleAuthorizationRequest: PolygonHandleAuthorizationRequest =
    React.useCallback(
      async ({ managerId, data }) => {
        const result = await invokeJs({
          js: `window.__HANDLE_AUTHORIZATION_REQUEST__({managerId: ${JSON.stringify(
            managerId
          )}, data: ${JSON.stringify(data)}})`,
        })
        return result as {
          callbackResponse: any
          authResponse: AuthorizationResponseMessage
        }
      },
      [invokeJs]
    )

  const handleCredentialsOffer: PolygonHandleCredentialsOffer =
    React.useCallback(
      async ({ managerId, data }) => {
        const result = await invokeJs({
          js: `window.__HANDLE_CREDENTIALS_OFFER__({managerId: ${JSON.stringify(
            managerId
          )}, data: ${JSON.stringify(data)}})`,
        })
        return result as W3CCredential[]
      },
      [invokeJs]
    )

  const source = React.useMemo(() => ({ uri }), [uri])

  return (
    <>
      {/* TODO: Test if we need isRequiredCircuitsDownloaded here as long as it is in the isReady above */}
      {!!isServerReady && !!isRequiredCircuitsDownloaded ? (
        <WebView
          source={source}
          originWhitelist={originWhitelist}
          startInLoadingState={true}
          pointerEvents='none'
          style={styles.hidden}
          onMessage={onMessage}
          onLoadStart={onLoadStart}
          onLoad={onLoad}
          onError={handleError}
          ref={ref}
          javaScriptEnabled={true}
          containerStyle={styles.hidden}
        />
      ) : null}
      <PolygonContextProvider
        value={React.useMemo<PolygonContextValue>(
          () => ({
            isReady,
            generateRandomKey,
            createIdManager,
            handleAuthorizationRequest,
            handleCredentialsOffer,
          }),
          [
            isReady,
            generateRandomKey,
            createIdManager,
            handleAuthorizationRequest,
            handleCredentialsOffer,
          ]
        )}>
        {children}
      </PolygonContextProvider>
    </>
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

function logWebappMessage(log: WebappLogMessage) {
  switch (log.level) {
    case 'debug':
      logger.debug(`Web app: ${log.message}`, log.data)
      break
    case 'info':
      logger.info(`Web app: ${log.message}`, log.data)
      break
    case 'warn':
      logger.warn(`Web app: ${log.message}`, log.data)
      break
    case 'error':
      logger.error(`Web app: ${log.message}`, log.data)

      let originalError
      if (log.data && 'error' in log.data && log.data.error) {
        originalError = JSON.parse(log.data.error as string)
      }

      Sentry.captureException(new Error(originalError?.message || log.message))
      break
  }
}
