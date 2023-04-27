import { Platform } from 'react-native'
import RNBlobUtil from 'react-native-blob-util'

export const WEBAPP_BUNDLE_DIR = Platform.select({
  android: 'www',
  default: `${RNBlobUtil.fs.dirs.MainBundleDir}/www`,
})

export const WEBAPP_ROOT_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/verida`

export const WEBAPP_PUBLIC_DIR = `${WEBAPP_ROOT_DIR}/public`

export const POLYGONID_CIRCUITS_DIR = `${WEBAPP_PUBLIC_DIR}/circuits`
