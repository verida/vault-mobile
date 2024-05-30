import { DependencyList, useEffect } from 'react'

import { emitter, EmitterTypes } from '~/helpers/emitter'

export function useEmitter<K extends keyof EmitterTypes>(
  key: K | undefined,
  callback: (payload: EmitterTypes[K]) => void,
  deps: DependencyList = []
) {
  useEffect(() => {
    if (!(key && callback)) return

    emitter.addListener(key, callback)
    return () => {
      emitter.removeListener(key, callback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, key, ...deps])

  return emitter
}
