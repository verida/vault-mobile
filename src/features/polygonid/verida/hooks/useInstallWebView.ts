import {
  WEBAPP_BUNDLE_DIR,
  WEBAPP_PUBLIC_DIR,
  WEBAPP_ROOT_DIR,
} from 'features/polygonid/constants'
import { Logger } from 'features/telemetry'
import * as React from 'react'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'

import { Stateful } from '../../@types'

const logger = Logger.create('Polygon ID')

const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useInstallWebView(): Stateful<string> {
  const [state, setState] = React.useState(loadingState)

  React.useEffect(() => {
    const init = async () => {
      try {
        const fromDir = WEBAPP_BUNDLE_DIR
        const toDir = WEBAPP_ROOT_DIR

        logger.info('Checking the Polygon ID web app')

        setState(loadingState)

        // Will throw an Error if the webapp isn't in the bundle
        await checkWebappBundleExist(fromDir)

        // Will throw an error if the bundle is empty
        const webappVersionAlreadyInstalled =
          await isWebappVersionAlreadyInstalled(fromDir, toDir)

        if (webappVersionAlreadyInstalled) {
          logger.info('Web app version is already installed')
        } else {
          logger.info('Web app version is not yet installed')

          await installWebapp(fromDir, toDir)

          const checkWebappIsInstalled = await isWebappVersionAlreadyInstalled(
            fromDir,
            toDir
          )
          if (checkWebappIsInstalled) {
            logger.info('Web app installation verified')
          } else {
            logger.warn('Web app installation cannot be verified')
            throw new Error('Web app installation cannot be verified')
          }

          logger.info('Web app successfully installed')
        }

        setState({ result: toDir, loading: false })
      } catch (error) {
        setState({
          error: new Error('Failed to install Polygon ID web app', {
            cause: error,
          }),
          loading: false,
        })
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
    logger.info('Web app bundle Dir exists')
  } else {
    logger.warn(`Web app bundle Dir doesn't exists`, {
      webappBundleDir,
    })
    throw new Error(`Polygon ID web app bundle Dir doesn't exists`)
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
    logger.warn(`Polygon ID web app bundle Dir is empty`, {
      webappBundleDir,
    })
    throw new Error(`Polygon ID web app bundle Dir is empty`)
  }

  const firstFile = files[0]
  const firstFilePath = firstFile.path.replace(`${webappBundleDir}/`, '')
  const targetFilePath = `${webappTargetDir}/${firstFilePath}`
  return await RNFS.exists(targetFilePath)
}

async function installWebapp(webappBundleDir: string, webappTargetDir: string) {
  logger.info('Installing new version of the web app')

  const webappDirExists = await isWebappDirExist(webappTargetDir)

  if (webappDirExists) {
    logger.info('Web app target dir already exists from a previous version')
    await removeWebAppContent(webappTargetDir)
  } else {
    logger.info(`Web app target dir doesn't exist`)
    logger.info(`Creating empty web app target dir`)
    await RNFS.mkdir(webappTargetDir)
  }

  await copyWebapp(webappBundleDir, webappTargetDir)
}

async function removeWebAppContent(webappDir: string) {
  logger.info('Removing current content of the web app')

  const reader = await RNFS.readDir(webappDir)
  await Promise.all(
    reader
      // Filter out the public directory containing the polygon ID circuits
      .filter((item) => item.path !== WEBAPP_PUBLIC_DIR)
      // Removing all other files
      .map(async (item) => {
        logger.debug(`Removing item from web app: ${item.path}`)

        await RNFS.unlink(item.path)
      })
  )
}

async function copyWebapp(fromDir: string, toDir: string) {
  logger.info('Copying the new version of the web app')

  await copyWebappItems(fromDir, fromDir, toDir)
}

async function copyWebappItems(
  rootFromDir: string,
  fromDir: string,
  toDir: string
) {
  logger.debug(`Copying web app items from ${fromDir}`)
  logger.debug(`Copying web app items to ${toDir}`)

  const reader =
    Platform.OS === 'android'
      ? await RNFS.readDirAssets(fromDir)
      : await RNFS.readDir(fromDir)

  const directories = reader.filter((item) => item.isDirectory())

  await Promise.all(
    directories.map(async (directory) => {
      const targetDirPath = `${toDir}/${directory.path.replace(
        `${rootFromDir}/`,
        ''
      )}`

      logger.debug(`Creating directory ${targetDirPath}`)

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

        logger.debug(`Copying file ${file.path} to ${targetFilePath}`)

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
