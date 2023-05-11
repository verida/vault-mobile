import type { CircuitId } from '@0xpolygonid/js-sdk'
import * as React from 'react'

import { CircuitProvider } from '../../circuit'
import { PolygonProvider } from '../../polygon'
import {
  FileServerProps,
  isFatalDirExistsState,
  useDirExists,
  useFileServer,
} from '../../server'

export const VeridaPolygonIdProvider = ({
  children,
  fileServer,
  requiredCircuitIds,
}: React.PropsWithChildren<{
  readonly fileServer: FileServerProps
  readonly requiredCircuitIds: readonly `${CircuitId}`[]
}>): JSX.Element => {
  const fileServerExists = useDirExists(fileServer)

  const { uri, isReady: isServerReady } = useFileServer(fileServer)

  // Dir represents the folder root where the polygon authentication site
  // is stored; i.e. <dir>/index.html.
  const { dir } = fileServer

  // The public dir is where assets are stored for consumption at the web root;
  // i.e. where we intend on storing circuits.
  const publicDir = `${dir}/public`

  // Ensure the public dir exists. (Force it to be created if it doesn't).
  const publicDirExists = useDirExists({ dir: publicDir, force: true })

  if (isFatalDirExistsState(fileServerExists))
    throw new Error(
      'Project configuration error. The fileServer must be guaranteed to exist.'
    )

  if (isFatalDirExistsState(publicDirExists))
    throw new Error(
      'Was unable to ensure the existence of a /public directory.'
    )

  // TODO: polygon provider must be sensitive to the loading state

  return (
    <CircuitProvider publicDir={publicDir} uri={uri}>
      <PolygonProvider
        uri={uri}
        isServerReady={isServerReady}
        requiredCircuitIds={requiredCircuitIds}>
        {children}
      </PolygonProvider>
    </CircuitProvider>
  )
}
