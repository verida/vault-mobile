import { Platform } from 'react-native'
import RNBlobUtil from 'react-native-blob-util'

const WEBAPP_DIR = 'www'

export const WEBAPP_BUNDLE_DIR = Platform.select({
  android: WEBAPP_DIR,
  default: `${RNBlobUtil.fs.dirs.MainBundleDir}/${WEBAPP_DIR}`,
})

export const WEBAPP_ROOT_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/verida`

export const WEBAPP_PUBLIC_DIR = `${WEBAPP_ROOT_DIR}/public`

export const POLYGONID_CIRCUITS_DIR = `${WEBAPP_PUBLIC_DIR}/circuits`
