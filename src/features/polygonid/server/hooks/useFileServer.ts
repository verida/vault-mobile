import * as React from 'react'
// @ts-expect-error missing_declaration
import StaticServer from 'react-native-static-server'

import { FileServerProps } from '../@types'

export function useFileServer({ dir, port }: FileServerProps) {
  const server = React.useMemo<StaticServer>(
    () => new StaticServer(port, dir, { localOnly: false }),
    [port, dir]
  )

  // HACK: We *must* use 127.0.0.1 and *not* localhost.
  //       On an emulator, you can also browse to this address.
  const uri = `http://127.0.0.1:${port}`

  React.useEffect(() => {
    server.start().catch(console.error)
    const handler = async () => {
      console.log(`Server state:`)
      console.log(await server.isRunning())
    }
    handler()

    return () => {
      try {
        console.log(`Stopping the server`)
        server.stop()
      } catch (e) {
        console.error(e)
      }
    }
  }, [server, port])

  return { uri }
}
