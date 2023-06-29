import type {
  AuthorizationResponseMessage,
  CircuitId,
  W3CCredential,
} from '@0xpolygonid/js-sdk'
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

const defaultGenerateRandomKey: RandomKeyGenerator = () => String(Math.random())

const originWhitelist = ['*']

type WebappLogMessage = {
  type: 'log'
  content: unknown
  level: 'info' | 'warn' | 'error' | 'debug'
}

export const PolygonProvider = ({
  generateRandomKey = defaultGenerateRandomKey, // TODO: use nanoid(), uuid(), etc.,
  // eslint-disable-next-line no-console
  onError = console.error,
  children,
  uri,
  isServerReady,
  requiredCircuitIds /* CircuitIds which must exist before attempting to mount the WebView. */,
}: React.PropsWithChildren<{
  readonly generateRandomKey?: RandomKeyGenerator
  readonly onError?: (error: Error) => void
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
            `Expected object result, encountered ${typeof result}.`
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
            `Expected non-empty string taskId, encountered "${String(taskId)}".`
          )

        const { [taskId]: maybeCallback } = polygonPromiseCallbacks.current

        if (!maybeCallback)
          throw new Error(
            `Encountered callback asynchrony; there was no taskId with signalling value "${taskId}" detected.`
          )

        // Clear this task; we have now latched the value within the scope of callback.
        delete polygonPromiseCallbacks.current[taskId]

        if ('error' in maybePolygonResult) {
          const { error } = maybePolygonResult
          return maybeCallback.reject(new Error(error.message))
        }

        if ('result' in maybePolygonResult) {
          const { result: promiseResult } = maybePolygonResult
          return maybeCallback.resolve(promiseResult)
        }

        throw new Error(`Encountered malformed message: "${maybeResult}"`)
      } catch (cause) {
        // @ts-expect-error language_version
        onError(new Error('Failed to handle received message.', { cause }))
      }
    },
    [onError]
  )

  const onLoadStart = React.useCallback(() => {
    // eslint-disable-next-line no-console
    console.debug('PolygonProvider ~ WebView loading...')
    // setWebPageLoading(true)
  }, [])

  const onLoad = React.useCallback(() => {
    // eslint-disable-next-line no-console
    console.debug('PolygonProvider ~ WebView loaded')
    // setWebPageLoading(false)
    setWebPageLoaded(true)
  }, [])

  const handleError = React.useCallback(() => {
    setWebPageLoaded(false)
    // eslint-disable-next-line no-console
    console.error('PolygonProvider ~ Error while loading the WebView')
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
          return reject(new Error('Not ready.'))
        }

        Object.assign(polygonPromiseCallbacks.current, {
          [taskId]: { resolve, reject },
        })

        const injectedJavaScript = `void (window.__HANDLE_PROMISE_TASK__({taskId: ${JSON.stringify(
          taskId
        )}, promise: ${js} }))`

        // eslint-disable-next-line no-console
        console.debug('Polygon.Provider.tsx ~ Injecting JavaScript in WebView')

        try {
          return ref.current?.injectJavaScript(injectedJavaScript)
        } catch (error: unknown) {
          // eslint-disable-next-line no-console
          console.error(
            'Polygon.Provider.tsx ~ Error while injecting JavaScript in WebView'
          )
          // eslint-disable-next-line no-console
          console.error(error)
        }
      })
    },
    [ref, generateRandomKey, isReady]
  )

  const createIdManager: PolygonCreateIdManager = React.useCallback(
    async (config: PolygonIdManagerConfig) => {
      // eslint-disable-next-line no-console
      console.debug('Polygon.Provider.tsx ~ Creating a Polygon ID Manager')

      const managerId = await invokeJs({
        js: `window.__CREATE_POLYGON_ID_MANAGER__({managerId: ${JSON.stringify(
          generateRandomKey()
        )}, config: ${JSON.stringify(config)}})`,
      })

      if (typeof managerId !== 'string' || !managerId.length)
        throw new Error(
          `Expected non-empty string managerId, encountered "${String(
            managerId
          )}".`
        )

      // eslint-disable-next-line no-console
      console.debug(
        'Polygon.Provider.tsx ~ Polygon ID Manager created',
        managerId
      )
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

function logWebappMessage(message: WebappLogMessage) {
  switch (message.level) {
    case 'info':
      // eslint-disable-next-line no-console
      console.info('Webapp message:', message.content)
      break
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn('Webapp message:', message.content)
      break
    case 'error':
      // eslint-disable-next-line no-console
      console.error('Webapp message:', message.content)
      break
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug('Webapp message:', message.content)
      break
  }
}
