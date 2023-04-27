import {
  WEBAPP_BUNDLE_DIR,
  WEBAPP_ROOT_DIR,
} from 'features/polygonid/constants'
import {
  useInstallWebView,
  VeridaPolygonIdProvider,
} from 'features/polygonid/verida'
import React from 'react'

import { PolygonIdManagerProvider } from './PolygonIdManagerContext'

export const PolygonIdProvider: React.FunctionComponent = (props) => {
  const { children } = props

  // Download the verida polygon scripts to a modifiable directory.
  const maybeWebViewDir = useInstallWebView({
    fromDir: WEBAPP_BUNDLE_DIR,
    toDir: WEBAPP_ROOT_DIR,
  })

  const maybeDir =
    'result' in maybeWebViewDir ? maybeWebViewDir.result : undefined

  // Wait to install the web application before attempting to use it.
  if (!maybeDir) {
    return <>{children}</>
  }

  return (
    <VeridaPolygonIdProvider // Serve from the installation directory.
      fileServer={{ port: 6002, dir: maybeDir }}
      requiredCircuitIds={['authV2', 'credentialAtomicQuerySigV2']}>
      <PolygonIdManagerProvider>{children}</PolygonIdManagerProvider>
    </VeridaPolygonIdProvider>
  )
}
