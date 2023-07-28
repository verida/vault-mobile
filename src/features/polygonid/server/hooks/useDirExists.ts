import * as React from 'react'
import RNBlobUtil from 'react-native-blob-util'

import { Stateful } from '../../@types'

const loadingState = (): Stateful<boolean> => ({
  loading: true,
})

export function useDirExists({
  dir,
  force = false,
}: {
  readonly dir: string
  // If the directory is found not to exist, create it.
  readonly force?: boolean
}): Stateful<boolean> {
  const [state, setState] = React.useState<Stateful<boolean>>(loadingState)

  const checkIfDirExists = React.useCallback(async () => {
    try {
      setState(loadingState)

      const exists = await RNBlobUtil.fs.exists(dir)

      if (!force || exists) return setState({ loading: false, result: exists })

      // Force the directory to exist if it doesn't already.
      // eslint-disable-next-line no-console
      await RNBlobUtil.fs.mkdir(dir).catch(console.warn) /* race_condition */

      setState({
        loading: false,
        result: await RNBlobUtil.fs.exists(dir),
      })
    } catch (cause) {
      setState({
        loading: false,
        error: new Error('Failed to check if directory exists.', { cause }),
      })
    }
  }, [dir, force])

  React.useEffect(() => {
    checkIfDirExists()
  }, [checkIfDirExists])

  return state
}
