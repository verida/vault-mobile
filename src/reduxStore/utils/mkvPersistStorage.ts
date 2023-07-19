import { MMKV } from 'react-native-mmkv'
import { initializeMMKVFlipper } from 'react-native-mmkv-flipper-plugin'
import { Storage } from 'redux-persist'

const storage = new MMKV()

if (__DEV__) {
  // Allow to debug MKKV in Flipper, install the plugin https://github.com/muchobien/flipper-plugin-react-native-mmkv
  initializeMMKVFlipper({ default: storage })
}

export const reduxPersistMkvStorage: Storage = {
  setItem: (key, value) => {
    storage.set(key, value)
    return Promise.resolve(true)
  },
  getItem: (key) => {
    const value = storage.getString(key)
    return Promise.resolve(value)
  },
  removeItem: (key) => {
    storage.delete(key)
    return Promise.resolve()
  },
}
