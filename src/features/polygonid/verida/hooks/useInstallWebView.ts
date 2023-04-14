import * as React from 'react'
import RNBlobUtil from 'react-native-blob-util'

import { Stateful } from '../../@types'

const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useInstallWebView({
  // Static Bundle Directory
  fromDir = `${RNBlobUtil.fs.dirs.MainBundleDir}/www`,
  // Target Directory
  toDir = `${RNBlobUtil.fs.dirs.DocumentDir}/verida`,
}: {
  readonly fromDir?: string
  readonly toDir?: string
} = {}): Stateful<string> {
  const [state, setState] = React.useState(loadingState)

  React.useEffect(() => {
    const init = async () => {
      try {
        setState(loadingState)

        if (!(await RNBlobUtil.fs.exists(fromDir)))
          throw new Error(`Failed to install from "${fromDir}".`)

        if (await RNBlobUtil.fs.exists(toDir)) {
          console.log('Directory already installed. Skipping installation...')
          return setState({ result: toDir, loading: false })
        }

        console.log('Installing WebView.')
        await RNBlobUtil.fs.cp(fromDir, toDir)

        if (__DEV__) {
          console.log('Directory content:')
          console.log(await RNBlobUtil.fs.ls(toDir))
        }

        console.log('Successfully installed!')

        setState({ result: toDir, loading: false })
      } catch (cause) {
        console.error(cause)
        // @ts-expect-error "cause"
        setState({ error: new Error('Failed to install WebView', { cause }) })
      }
    }
    init()
  }, [toDir, fromDir])

  return state
}
