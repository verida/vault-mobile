import type { CircuitId } from '@0xpolygonid/js-sdk'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import {
  useEnsureCircuitsDownloaded,
  useIsCircuitsDownloaded,
} from '../../circuit'
import {
  PolygonContextValue,
  PolygonCreateIdManager,
  PolygonHandleAuthorizationRequest,
  PolygonHandleAuthorizationRequestArgs,
  PolygonHandleCredentialOffer,
  PolygonHandleCredentialOfferArgs,
  PolygonIdManagerConfig,
  PolygonPromiseCallbacks,
  PolygonWebViewCallbackProps,
  RandomKeyGenerator,
} from '../@types'
import { PolygonContextProvider } from '../contexts'

const defaultGenerateRandomKey: RandomKeyGenerator = () => String(Math.random())

const originWhitelist = ['*']

export const PolygonProvider = ({
  generateRandomKey = defaultGenerateRandomKey, // TODO: use nanoid(), uuid(), etc.,
  onError = console.error,
  children,
  uri,
  requiredCircuitIds /* CircuitIds which must exist before attempting to mount the WebView. */,
}: React.PropsWithChildren<{
  readonly generateRandomKey?: RandomKeyGenerator
  readonly onError?: (error: Error) => void
  readonly uri: string
  readonly requiredCircuitIds: readonly `${CircuitId}`[]
}>): JSX.Element => {
  const ref = React.useRef<WebView>(null)

  // Ensure the circuits are downloaded.
  useEnsureCircuitsDownloaded(requiredCircuitIds)

  const isCircuitsDownloaded = useIsCircuitsDownloaded(requiredCircuitIds)

  const isRequiredCircuitsDownloaded =
    'result' in isCircuitsDownloaded && isCircuitsDownloaded.result

  const [webPageLoaded, setWebPageLoaded] = React.useState<boolean>(false)
  const [webPageLoading, setWebPageLoading] = React.useState<boolean>(true)

  const polygonPromiseCallbacks = React.useRef<PolygonPromiseCallbacks>({})

  const onMessage = React.useCallback(
    ({ nativeEvent: { data: maybeResult } }: WebViewMessageEvent) => {
      console.debug('maybeResult', maybeResult)
      try {
        const result = JSON.parse(maybeResult)

        if (!result || typeof result !== 'object')
          throw new Error(
            `Expected object result, encountered ${typeof result}.`
          )

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
        onError(new Error('Failed to handle received message.', { cause }))
      }
    },
    [onError]
  )

  const onLoadStart = React.useCallback(() => {
    console.debug('onLoadStart WebView')
    setWebPageLoading(true)
  }, [])

  const onLoadEnd = React.useCallback(() => {
    console.debug('onLoadEnd WebView')
    setWebPageLoading(false)
    setWebPageLoaded(true)
  }, [])

  // Mark the PolygonProvider as in a loading state if either the webpage is loading
  // or we don't have all of the required circuits cached to the local device.
  const loading = webPageLoading || !isRequiredCircuitsDownloaded
  const isReady = webPageLoaded || isRequiredCircuitsDownloaded

  const invokeJs = React.useCallback(
    ({
      js,
      taskId = generateRandomKey(),
    }: {
      readonly js: string
      readonly taskId?: string
    }) =>
      new Promise<unknown>((resolve, reject) => {
        console.debug('invokeJs')
        console.debug(js)
        console.log('isReady:', isReady)

        if (!isReady) return reject(new Error('Not ready.'))

        Object.assign(polygonPromiseCallbacks.current, {
          [taskId]: { resolve, reject },
        })

        const injectedJavaScript = `void (window.__HANDLE_PROMISE_TASK__({taskId: ${JSON.stringify(
          taskId
        )}, promise: ${js} }))`

        __DEV__ && console.log(injectedJavaScript)

        console.debug('Injecting JS')
        return ref?.current?.injectJavaScript(injectedJavaScript)
      }),
    [ref, generateRandomKey, isReady]
  )

  const createIdManager: PolygonCreateIdManager = React.useCallback(
    async (config: PolygonIdManagerConfig) => {
      const maybeManagerId = await invokeJs({
        js: `window.__CREATE_POLYGON_ID_MANAGER__({managerId: ${JSON.stringify(
          generateRandomKey()
        )}, config: ${JSON.stringify(config)}})`,
      })

      if (typeof maybeManagerId !== 'string' || !maybeManagerId.length)
        throw new Error(
          `Expected non-empty string managerId, encountered "${String(
            maybeManagerId
          )}".`
        )

      return maybeManagerId
    },
    [invokeJs, generateRandomKey]
  )

  const handleAuthorizationRequest: PolygonHandleAuthorizationRequest =
    React.useCallback(
      async ({
        managerId,
        data,
      }: PolygonHandleAuthorizationRequestArgs): Promise<string> => {
        const result = await invokeJs({
          js: `window.__HANDLE_AUTHORIZATION_REQUEST__({managerId: ${JSON.stringify(
            managerId
          )}, data: ${JSON.stringify(data)}})`,
        })

        console.debug('=================================================')
        console.debug('result', result)
        console.debug('=================================================')

        // if (typeof result !== 'string' || !result.length)
        //   throw new Error(
        //     `Expected non-empty string result, encountered "${String(result)}".`
        //   )

        return result as string
      },
      [invokeJs]
    )

  const handleCredentialOffer: PolygonHandleCredentialOffer = React.useCallback(
    async ({
      managerId,
      data,
    }: PolygonHandleCredentialOfferArgs): Promise<string> => {
      const result = await invokeJs({
        js: `window.__HANDLE_CREDENTIAL_OFFER__({managerId: ${JSON.stringify(
          managerId
        )}, data: ${JSON.stringify(data)}})`,
      })

      if (typeof result !== 'string' || !result.length)
        throw new Error(
          `Expected non-empty string result, encountered "${String(result)}".`
        )

      return result
    },
    [invokeJs]
  )

  const source = React.useMemo(() => ({ uri }), [uri])

  return (
    <>
      {/* HACK: Do not permit the WebView to mount until the circuits are downloaded. */}
      {!!isRequiredCircuitsDownloaded && (
        <WebView
          source={source}
          originWhitelist={originWhitelist}
          startInLoadingState
          pointerEvents='none'
          style={styles.hidden}
          onMessage={onMessage}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          ref={ref}
          javaScriptEnabled
          containerStyle={styles.hidden}
        />
      )}
      <PolygonContextProvider
        value={React.useMemo<PolygonContextValue>(
          () => ({
            loading,
            generateRandomKey,
            createIdManager,
            handleAuthorizationRequest,
            handleCredentialOffer,
          }),
          [
            loading,
            generateRandomKey,
            createIdManager,
            handleAuthorizationRequest,
            handleCredentialOffer,
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
