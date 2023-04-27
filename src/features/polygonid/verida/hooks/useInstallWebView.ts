import * as React from 'react'
import { Platform } from 'react-native'
import RNBlobUtil from 'react-native-blob-util'
import RNFS from 'react-native-fs'

import { Stateful } from '../../@types'

const copyAssetWebFolderToDocument = async (fromDir: string, toDir: string) => {
  const reader = await RNFS.readDirAssets(fromDir)

  const directories = reader.filter((item) => item.isDirectory())
  await Promise.all(
    directories.map(async (directory) => {
      const targetDirPath = `${toDir}/${directory.path.replace(
        `${fromDir}/`,
        ''
      )}`
      await RNFS.mkdir(targetDirPath)
    })
  )

  await Promise.all(
    reader
      .filter((item) => item.isFile())
      .map(async (file) => {
        const targetFilePath = `${toDir}/${file.path.replace(
          `${fromDir}/`,
          ''
        )}`
        await RNFS.copyFileAssets(file.path, targetFilePath)
      })
  )

  const directioriesFilesPromises = directories.map((dir) =>
    copyAssetWebFolderToDocument(dir.path, toDir)
  )

  await Promise.all(directioriesFilesPromises)
}

const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useInstallWebView({
  fromDir,
  toDir,
}: {
  /** Location of the webapp in the Application bundle */
  readonly fromDir: string
  /** Where the webapp will be installed */
  readonly toDir: string
}): Stateful<string> {
  const [state, setState] = React.useState(loadingState)

  React.useEffect(() => {
    const init = async () => {
      try {
        setState(loadingState)

        if (Platform.OS === 'ios') {
          if (!(await RNBlobUtil.fs.exists(fromDir))) {
            throw new Error(`Failed to install from "${fromDir}".`)
          }

          if (await RNBlobUtil.fs.exists(toDir)) {
            // TODO: Check the content of the directory and overwritten if needing an update
            return setState({ result: toDir, loading: false })
          }

          await RNBlobUtil.fs.cp(fromDir, toDir)
        } else if (Platform.OS === 'android') {
          const webAsset = RNBlobUtil.fs.asset(`${fromDir}/index.html`)
          if (!webAsset) {
            throw new Error(`Failed to install from "${fromDir}".`)
          }

          if (await RNBlobUtil.fs.exists(toDir)) {
            // TODO: Check the content of the directory and overwritten if needing an update
            return setState({ result: toDir, loading: false })
          }

          await RNFS.mkdir(toDir)
          await copyAssetWebFolderToDocument(fromDir, toDir)
        }

        console.debug('[useInstallWebView] Webapp directory content:')
        console.debug(await RNBlobUtil.fs.ls(toDir))

        console.log('[useInstallWebView] Webapp successfully installed!')

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
