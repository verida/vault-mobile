import * as React from 'react'
import RNBlobUtil from 'react-native-blob-util'
import RNFS from 'react-native-fs'

import { Stateful } from '../../@types'
import { Platform } from 'react-native'

const copyAssetWebFolderToDocument = async (fromDir: string, toDir: string) => {
  const reader = await RNFS.readDirAssets(fromDir);

  const directories = reader.filter((item) => item.isDirectory());
  await Promise.all(directories.map(async (directory) => {
    await RNFS.mkdir(`${toDir}/${directory.path}`)
  }))
  
  await Promise.all(reader.filter((item) => item.isFile()).map(async (file) => {
    await RNFS.copyFileAssets(file.path, `${toDir}/${file.path}`)
  }))

  const directioriesFilesPromises = directories.map((dir) => (
    copyAssetWebFolderToDocument(dir.path, toDir)
  ));

  await Promise.all(directioriesFilesPromises);
};


const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useInstallWebView({
  // Static Bundle Directory
  fromDir = Platform.select({
    'android': 'www',
    default: `${RNBlobUtil.fs.dirs.MainBundleDir}/www`
  }),
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

        if (Platform.OS === 'ios') {
          if (!(await RNBlobUtil.fs.exists(fromDir)))
            throw new Error(`Failed to install from "${fromDir}".`)

          if (await RNBlobUtil.fs.exists(toDir)) {
            console.log('Directory already installed. Skipping installation...')
            return setState({ result: toDir, loading: false })
          }

          console.log('Installing WebView.')
          await RNBlobUtil.fs.cp(fromDir, toDir)
        } else if (Platform.OS === 'android') {
          const webAsset = RNBlobUtil.fs.asset('www/index.html')
          if (!webAsset) {
            throw new Error(`Failed to install from "${fromDir}".`)
          }

          if (await RNBlobUtil.fs.exists(`${toDir}/www`)) {
            console.log('Directory already installed. Skipping installation...')
            return setState({ result: toDir, loading: false })
          }

          console.log('Installing WebView.')
          await RNFS.mkdir(`${toDir}/www`)
          await copyAssetWebFolderToDocument(fromDir, toDir)
        }


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
