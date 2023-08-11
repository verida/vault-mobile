import { POLYGON_ID_WEB_APP_SERVER_PORT } from 'features/polygonid/constants'
import {
  useInstallWebView,
  VeridaPolygonIdProvider,
} from 'features/polygonid/verida'
import { Sentry } from 'features/telemetry'
import React from 'react'

import { ALL_CIRCUIT_IDS } from '../circuit/constants'
import { PolygonIdManagerProvider } from './PolygonIdManagerContext'

export const PolygonIdProvider: React.FunctionComponent = (props) => {
  const { children } = props

  // Download the verida polygon scripts to a modifiable directory.
  const webappInstallState = useInstallWebView()

  if ('error' in webappInstallState) {
    Sentry.captureException(webappInstallState.error)
  }

  const webAppDir =
    'result' in webappInstallState ? webappInstallState.result : undefined

  // Wait to install the web application before attempting to use it.
  if (!webAppDir) {
    return <>{children}</>
  }

  return (
    <VeridaPolygonIdProvider // Serve from the installation directory.
      fileServer={{ port: POLYGON_ID_WEB_APP_SERVER_PORT, dir: webAppDir }}
      requiredCircuitIds={ALL_CIRCUIT_IDS}>
      <PolygonIdManagerProvider>{children}</PolygonIdManagerProvider>
    </VeridaPolygonIdProvider>
  )
}
