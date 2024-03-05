import type { CircuitId } from '@0xpolygonid/js-sdk'
import { Logger } from 'features/telemetry'
import * as React from 'react'

import { CircuitProvider } from '../../circuit'
import { PolygonProvider } from '../../polygon'
import {
  FileServerProps,
  isFatalDirExistsState,
  useDirExists,
  useFileServer,
} from '../../server'

const logger = Logger.create('Polygon ID')

export const VeridaPolygonIdProvider = ({
  children,
  fileServer,
  requiredCircuitIds,
}: React.PropsWithChildren<{
  readonly fileServer: FileServerProps
  readonly requiredCircuitIds: readonly `${CircuitId}`[]
}>): JSX.Element => {
  // Dir represents the folder root where the Polygon ID web app site
  // is located; i.e. <dir>/index.html.
  const { dir } = fileServer
  const fileServerDirExistsState = useDirExists({ dir })

  if (isFatalDirExistsState(fileServerDirExistsState)) {
    logger.warn(
      `Project configuration error. The fileServer must be guaranteed to exist.`
    )
    throw new Error(
      'Project configuration error. The fileServer must be guaranteed to exist.'
    )
  }

  // The public dir is where assets are stored for consumption at the web root;
  // i.e. where we intend on storing circuits.
  const publicDir = `${dir}/public`

  // Ensure the public dir exists. (Force it to be created if it doesn't).
  const publicDirExists = useDirExists({ dir: publicDir, force: true })

  if (isFatalDirExistsState(publicDirExists)) {
    logger.warn(`Was unable to ensure the existence of a /public directory`)
    throw new Error('Was unable to ensure the existence of a /public directory')
  }

  const { uri, isReady: isServerReady } = useFileServer(fileServer)

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
