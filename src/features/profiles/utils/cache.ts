import { AppState } from 'react-native'
import { MMKV } from 'react-native-mmkv'

import { PublicProfile } from '../types'

type CacheValue = {
  value: PublicProfile
  timestamp: number
}

const PROFILES_CACHE_KEY = 'public-profiles'

export const publicProfileStorage = new MMKV({
  id: 'public-profiles-cache',
})

const createProfilesCache = (maxSize = 20) => {
  let cache: Map<string, CacheValue> = new Map()
  let keys: string[] = []

  const loadState = () => {
    const serializedState = publicProfileStorage.getString(PROFILES_CACHE_KEY)
    if (serializedState) {
      const parsedState = new Map(JSON.parse(serializedState)) as any
      cache = parsedState
      keys = Array.from(parsedState.keys())
    }
  }

  const saveState = () => {
    const serializedState = JSON.stringify(Array.from(cache.entries()))
    publicProfileStorage.set(PROFILES_CACHE_KEY, serializedState)
  }

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      saveState()
    }
  }

  const updateKeyUsage = (key: string) => {
    const index = keys.indexOf(key)
    if (index > -1) {
      keys.splice(index, 1)
    }
    keys.push(key)
  }

  const evictIfNeeded = () => {
    while (keys.length > maxSize) {
      const keyToEvict = keys.shift()
      if (keyToEvict) {
        cache.delete(keyToEvict)
      }
    }
  }

  const get = (key: string): CacheValue | null => {
    if (cache.has(key)) {
      const item = cache.get(key)
      updateKeyUsage(key)
      return item || null
    }
    return null
  }

  const set = (key: string, value: any): void => {
    cache.set(key, { value, timestamp: Date.now() })
    updateKeyUsage(key)
    evictIfNeeded()
  }

  const remove = (key: string): void => {
    if (cache.has(key)) {
      cache.delete(key)
      const index = keys.indexOf(key)
      if (index > -1) {
        keys.splice(index, 1)
      }
    }
  }

  // Load the cache state when the module is initialized
  loadState()
  AppState.addEventListener('change', handleAppStateChange)

  return { get, set, remove, saveState, loadState }
}

let cache: ReturnType<typeof createProfilesCache> | undefined
export const getProfilesCache = () => {
  if (!cache) {
    cache = createProfilesCache()
  }

  return cache
}
