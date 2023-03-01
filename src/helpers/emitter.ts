import EventEmitter from 'events'

export type EmitterTypes = {
  SAVE_GENERIC_PROPERTY: {
    screenName: string
    title?: string
    value: any
    originalValue?: any
    mode?: string | number
  }
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
    // eslint-disable-next-line no-console
    if (__DEV__) console.debug('[EMITTER]', key, payload)
    _emitter.emit(key, payload)
  },
}
