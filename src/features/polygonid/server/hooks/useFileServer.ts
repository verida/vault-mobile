import { Logger } from 'features/telemetry'
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
    logger.debug(`Starting server`, { port })
    server
      .start()
      .then(() => {
        setIsReady(true)
        logger.debug('Server started')
      })
      .catch(logger.error)
    return () => {
      try {
        logger.debug('Stopping server')
        setIsReady(false)
        server.stop()
      } catch (error: unknown) {
        logger.error('Error while stopping the server', { error })
      }
    }
  }, [server, port])

  return { uri, isReady }
}
