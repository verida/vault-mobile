import { Logger, Sentry } from 'features/telemetry'
import * as React from 'react'
import { Platform } from 'react-native'
// @ts-expect-error missing_declaration
import StaticServer from 'react-native-static-server'

import { FileServerProps } from '../@types'

const logger = new Logger('Polygon ID')

export function useFileServer({ dir, port }: FileServerProps) {
  const [isReady, setIsReady] = React.useState(false)

  const server = React.useMemo<StaticServer>(
    () => new StaticServer(port, dir, { localOnly: true }),
    [port, dir]
  )

  // HACK: We *must* use 127.0.0.1 and *not* localhost.
  //       On an emulator, you can also browse to this address.
  const uri = Platform.select({
    android: `http://localhost:${port}`,
    default: `http://127.0.0.1:${port}`,
  })

  React.useEffect(() => {
    logger.info(`Starting web app server`, { port })
    server
      .start()
      .then(() => {
        setIsReady(true)
        logger.info('Web app server started', { port })
      })
      .catch((error: unknown) => {
        logger.warn('Error while starting the server')
        Sentry.captureException(error)
      })

    return () => {
      try {
        logger.info('Stopping web app server')
        setIsReady(false)
        server.stop()
        logger.info('Web app server stopped')
      } catch (error: unknown) {
        logger.warn('Error while stopping the server')
        Sentry.captureException(error)
      }
    }
  }, [server, port])

  return { uri, isReady }
}
