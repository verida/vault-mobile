import 'react-native-url-polyfill/auto'

import { AppContexts } from 'contexts'
import { Sentry } from 'features/telemetry'
import { useAppInit } from 'hooks'
import { MainNavigator } from 'navigation'
import React from 'react'
import codePush, { CodePushOptions } from 'react-native-code-push'
import PolyfillCrypto from 'react-native-webview-crypto'
import { initApplication } from 'utils'

initApplication()

const App = () => {
  const { initialised } = useAppInit()

  const AppContent = (
    <>
      <PolyfillCrypto />
      <AppContexts>
        <MainNavigator />
      </AppContexts>
    </>
  )

  return initialised ? AppContent : null // TODO: Can we just return AppContent, even if it's hidden behind the splash screen?
}

const WrappedWithSentry = Sentry.wrap(App)

const codePushOptions: CodePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
}

export default codePush(codePushOptions)(WrappedWithSentry)
