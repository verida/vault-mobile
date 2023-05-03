import * as React from 'react'
import { Platform } from 'react-native'
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
  const uri = Platform.select({
    android: `http://localhost:${port}`,
    default: `http://127.0.0.1:${port}`,
  })

  React.useEffect(() => {
    server.start().catch(console.error)
    return () => {
      try {
        server.stop()
      } catch (e) {
        console.error(e)
      }
    }
  }, [server, port])

  return { uri }
}
