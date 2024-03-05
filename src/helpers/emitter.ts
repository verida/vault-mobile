import EventEmitter from 'events'
import { Logger } from 'features/telemetry'

const logger = Logger.create('Emitter')

export type EmitterTypes = {
  SAVE_GENERIC_PROPERTY: {
    screenName: string
    title?: string
    value: any
    originalValue?: any
    mode?: string | number
  }
  UNLOCK_VERIDA_ONE: undefined
  UPDATE_PROFILE_USERNAME: Record<string, unknown>
  UPDATE_PUBLIC_PROFILE: undefined

  PUBLIC_PROFILE_LOADED: { profileId: string }

  // Identity status
  IDENTITY_NOT_EXIST: {
    retry?: () => void
  }
  APP_RECOVER_FROM_ERROR: undefined
}

const _emitter = new EventEmitter()

export const emitter = {
  addListener<K extends keyof EmitterTypes>(
    key: K,
    listener: (payload: EmitterTypes[K]) => void
  ) {
    return _emitter.on(key, listener)
  },

  removeListener<K extends keyof EmitterTypes>(
    key: K,
    listener: (payload: EmitterTypes[K]) => void
  ) {
    return _emitter.off(key, listener)
  },

  emit<K extends keyof EmitterTypes>(key: K, payload: EmitterTypes[K]) {
    logger.debug(`Emitting ${key}`, { payload })
    _emitter.emit(key, payload)
  },
}
