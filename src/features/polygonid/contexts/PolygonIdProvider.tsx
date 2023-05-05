import {
  useInstallWebView,
  VeridaPolygonIdProvider,
} from 'features/polygonid/verida'
import React from 'react'

import { ALL_CIRCUIT_IDS } from '../circuit/constants'
import { PolygonIdManagerProvider } from './PolygonIdManagerContext'

export const PolygonIdProvider: React.FunctionComponent = (props) => {
  const { children } = props

  // Download the verida polygon scripts to a modifiable directory.
  const maybeWebViewDir = useInstallWebView()

  const maybeDir =
    'result' in maybeWebViewDir ? maybeWebViewDir.result : undefined

  // Wait to install the web application before attempting to use it.
  if (!maybeDir) {
    return <>{children}</>
  }

  return (
    <VeridaPolygonIdProvider // Serve from the installation directory.
      fileServer={{ port: 6002, dir: maybeDir }}
      requiredCircuitIds={ALL_CIRCUIT_IDS}>
      <PolygonIdManagerProvider>{children}</PolygonIdManagerProvider>
    </VeridaPolygonIdProvider>
  )
}
