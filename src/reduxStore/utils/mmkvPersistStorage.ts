import { MMKV } from 'react-native-mmkv'
import { Storage } from 'redux-persist'

export const reduxStorage = new MMKV()

export const reduxPersistMmkvStorage: Storage = {
  setItem: (key, value) => {
    reduxStorage.set(key, value)
    return Promise.resolve(true)
  },
  getItem: (key) => {
    const value = reduxStorage.getString(key)
    return Promise.resolve(value)
  },
  removeItem: (key) => {
    reduxStorage.delete(key)
    return Promise.resolve()
  },
}
