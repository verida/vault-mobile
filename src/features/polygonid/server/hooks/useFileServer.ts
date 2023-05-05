import * as React from 'react'
// @ts-expect-error missing_declaration
import StaticServer from 'react-native-static-server'

import { FileServerProps } from '../@types'

export function useFileServer({ dir, port }: FileServerProps) {
  const server = React.useMemo<StaticServer>(
    () => new StaticServer(port, dir, { localOnly: true }),
    [port, dir]
  )

  // HACK: We *must* use 127.0.0.1 and *not* localhost.
  //       On an emulator, you can also browse to this address.
  const uri = `http://127.0.0.1:${port}`

  React.useEffect(() => {
    console.debug(`useFileServer ~ Starting server on port ${port}`)
    server
      .start()
      .then(() => {
        console.debug('useFileServer ~ Server started')
      })
      .catch(console.error)
    return () => {
      try {
        console.debug('useFileServer ~ Stopping server')
        server.stop()
      } catch (e) {
        console.error('useFileServer ~ Error stopping the server')
        console.error(e)
      }
    }
  }, [server, port])

  return { uri }
}
