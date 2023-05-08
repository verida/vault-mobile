import {
  WEBAPP_BUNDLE_DIR,
  WEBAPP_PUBLIC_DIR,
  WEBAPP_ROOT_DIR,
} from 'features/polygonid/constants'
import * as React from 'react'
import { Platform } from 'react-native'
import RNBlobUtil from 'react-native-blob-util'
import RNFS from 'react-native-fs'

import { Stateful } from '../../@types'

const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useInstallWebView(): Stateful<string> {
  const [state, setState] = React.useState(loadingState)

  React.useEffect(() => {
    const init = async () => {
      try {
        const fromDir = WEBAPP_BUNDLE_DIR
        console.debug(
          'useInstallWebView.ts ~ useInstallWebView ~ fromDir:',
          fromDir
        )

        const toDir = WEBAPP_ROOT_DIR
        console.debug(
          'useInstallWebView.ts ~ useInstallWebView ~ toDir:',
          toDir
        )

        setState(loadingState)

        // Will throw an Error if the webapp isn't in the bundle
        await checkWebappBundleExist(fromDir)

        const webappVersionAlreadyInstalled =
          await isWebappVersionAlreadyInstalled(fromDir, toDir)

        if (webappVersionAlreadyInstalled) {
          console.debug(
            'useInstallWebView.ts ~ useInstallWebView ~ Webapp version already installed'
          )

          // Do nothing
        } else {
          console.debug(
            'useInstallWebView.ts ~ useInstallWebView ~ Webapp version not yet installed'
          )

          await installWebapp(fromDir, toDir)
        }

        console.debug(
          'useInstallWebView.ts ~ useInstallWebView ~ Webapp directory content:',
          await RNBlobUtil.fs.ls(toDir)
        )

        console.log('[useInstallWebView] Webapp successfully installed!')

        setState({ result: toDir, loading: false })
      } catch (cause) {
        console.error(cause)
        // @ts-expect-error "cause"
        setState({ error: new Error('Failed to install WebView', { cause }) })
      }
    }
    init()
  }, [])

  return state
}

async function checkWebappBundleExist(webappBundleDir: string) {
  const isFromDirExist =
    Platform.OS === 'android'
      ? await RNFS.existsAssets(webappBundleDir)
      : await RNFS.exists(webappBundleDir)

  if (isFromDirExist) {
    console.debug(
      'useInstallWebView.ts ~ checkWebappBundleExist ~ webappBundleDir exists'
    )
  } else {
    console.debug(
      'useInstallWebView.ts ~ checkWebappBundleExist ~ webappBundleDir doesnt exist'
    )
    throw new Error(
      `Failed to install the Webapp. Directory in bundle doesn't exists.`
    )
  }
}

async function isWebappDirExist(webappTargetDir: string) {
  // RNFS.exists is supported on both platforms
  return await RNFS.exists(webappTargetDir)
}

async function isWebappVersionAlreadyInstalled(
  webappBundleDir: string,
  webappTargetDir: string
) {
  // The js files have a deterministic hash in their name. We can check if the same file already exist. If not it's not the same version.

  const jsDir = `${webappBundleDir}/static/js`

  let assets
  if (Platform.OS === 'android') {
    assets = await RNFS.readDirAssets(jsDir)
  } else {
    assets = await RNFS.readDir(jsDir)
  }
  const files = assets.filter((item) => item.isFile())

  if (files.length === 0) {
    throw new Error(
      `Failed to install the Webapp. Directory in bundle is empty.`
    )
  }

  const firstFile = files[0]
  const firstFilePath = firstFile.path.replace(`${webappBundleDir}/`, '')
  const targetFilePath = `${webappTargetDir}/${firstFilePath}`
  return await RNFS.exists(targetFilePath)
}

async function installWebapp(webappBundleDir: string, webappTargetDir: string) {
  const webappDirExists = await isWebappDirExist(webappTargetDir)

  if (webappDirExists) {
    console.debug(
      'useInstallWebView.ts ~ installWebapp ~ Webapp target dir already exists, meaning it is a previous version of the Webapp'
    )

    await removeWebAppContent(webappTargetDir)
  } else {
    console.debug(
      'useInstallWebView.ts ~ installWebapp ~ Webapp target dir doesnt exist'
    )

    await RNFS.mkdir(webappTargetDir)
  }

  await copyWebapp(webappBundleDir, webappTargetDir)
}

async function removeWebAppContent(webappDir: string) {
  console.debug(
    'useInstallWebView.ts ~ removeWebAppContent ~ Removing previous webapp version content'
  )

  const reader = await RNFS.readDir(webappDir)
  await Promise.all(
    reader
      // Filter out the public directory containing the polygon ID circuits
      .filter((item) => item.path !== WEBAPP_PUBLIC_DIR)
      // Removing all other files
      .map(async (item) => {
        console.debug(
          'useInstallWebView.ts ~ removeWebAppContent ~ Removing item:',
          item.path
        )

        await RNFS.unlink(item.path)
      })
  )
}

async function copyWebapp(fromDir: string, toDir: string) {
  console.debug(
    'useInstallWebView.ts ~ copyWebapp ~ Copying the new version of the Webapp'
  )

  await copyWebappItems(fromDir, fromDir, toDir)
}

async function copyWebappItems(
  rootFromDir: string,
  fromDir: string,
  toDir: string
) {
  console.debug(
    `useInstallWebView.ts ~ copyAssetWebFolderToDocument ~ Copying Webapp items from ${fromDir}`
  )
  console.debug(
    `useInstallWebView.ts ~ copyAssetWebFolderToDocument ~ Copying Webapp items to ${toDir}`
  )

  const reader =
    Platform.OS === 'android'
      ? await RNFS.readDirAssets(fromDir)
      : await RNFS.readDir(fromDir)

  const directories = reader.filter((item) => item.isDirectory())

  await Promise.all(
    directories.map(async (directory) => {
      console.debug(
        `useInstallWebView.ts ~ copyAssetWebFolderToDocument ~ directory.path:`,
        directory.path
      )

      const targetDirPath = `${toDir}/${directory.path.replace(
        `${rootFromDir}/`,
        ''
      )}`

      console.debug(
        `useInstallWebView.ts ~ copyAssetWebFolderToDocument ~ Creating directory ${targetDirPath}`
      )

      await RNFS.mkdir(targetDirPath)
    })
  )

  await Promise.all(
    reader
      .filter((item) => item.isFile())
      .map(async (file) => {
        const targetFilePath = `${toDir}/${file.path.replace(
          `${rootFromDir}/`,
          ''
        )}`

        console.debug(
          `useInstallWebView.ts ~ copyAssetWebFolderToDocument ~ Copying file ${file.path} to ${targetFilePath}`
        )

        if (Platform.OS === 'android') {
          await RNFS.copyFileAssets(file.path, targetFilePath)
        } else {
          await RNFS.copyFile(file.path, targetFilePath)
        }
      })
  )

  await Promise.all(
    directories.map((dir) => copyWebappItems(rootFromDir, dir.path, toDir))
  )
}
