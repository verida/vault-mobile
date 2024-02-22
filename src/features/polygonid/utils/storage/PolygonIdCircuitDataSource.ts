import { CircuitData, CircuitId, IDataSource } from '@0xpolygonid/js-sdk'
import { MMKV } from 'react-native-mmkv'

const polygonIdCircuitStorage = new MMKV({
  id: 'circuit_data_storage',
})

const CIRCUIT_DATA_KEY_PREFIX = 'circuit'

function buildKey(key: string, circuitComponentKey: string) {
  return [CIRCUIT_DATA_KEY_PREFIX, key, circuitComponentKey].join('_')
}

export class PolygonIdCircuitDataSource implements IDataSource<CircuitData> {
  constructor() {
    // nothing
  }

  load(): Promise<CircuitData[]> {
    throw new Error('Method not implemented')
  }

  save(key: string, value: CircuitData, _keyName = 'id'): Promise<void> {
    Object.keys(value).map((circuitComponentKey) => {
      const storeKey = buildKey(key, circuitComponentKey)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore because the key comes from the value object
      const data = value[circuitComponentKey] as Uint8Array | string | null
      if (data) {
        polygonIdCircuitStorage.set(storeKey, data)
      }
    })
    return Promise.resolve()
  }

  get(circuitKey: string, _keyName = 'id'): Promise<CircuitData | undefined> {
    const allKeys = polygonIdCircuitStorage.getAllKeys()

    const keys = allKeys.filter((key) => key.includes(circuitKey))
    if (keys.length === 0) {
      return Promise.resolve(undefined)
    }

    const dataElements = keys.map((key) => {
      const [keyName] = key.split('_').reverse()
      let data = null
      if (keyName === 'circuitId') {
        data = polygonIdCircuitStorage.getString(key)
      } else {
        data = polygonIdCircuitStorage.getBuffer(key) ?? null
      }

      return {
        [keyName]: data ?? null,
      }
    })

    const circuitData = dataElements.reduce((acc, dataElement) => {
      const [[key, data]] = Object.entries(dataElement)
      acc[key] = data
      return acc
    }, {})

    return Promise.resolve(circuitData as CircuitData)
  }

  delete(_key: string, _keyName = 'id'): Promise<void> {
    throw new Error('Method not implemented')
  }

  exists(circuitId: CircuitId): boolean {
    const dumbCircuitData: CircuitData = {
      circuitId: '',
      provingKey: null,
      verificationKey: null,
      wasm: null,
    }

    const circuitKeys = Object.keys(dumbCircuitData).map(
      (circuitComponentKey) => buildKey(circuitId, circuitComponentKey)
    )
    return circuitKeys.every((key) => polygonIdCircuitStorage.contains(key))
  }
}
