import { CircuitData, IDataSource } from '@0xpolygonid/js-sdk'
import { MMKV } from 'react-native-mmkv'

const CIRCUIT_DATA_KEY_PREFIX = 'circuit'

export class PolygonIdCircuitDataSource implements IDataSource<CircuitData> {
  private storage: MMKV

  constructor() {
    this.storage = new MMKV({
      id: 'circuit_data_storage',
    })
  }

  load(): Promise<CircuitData[]> {
    throw new Error('Method not implemented')
  }

  save(key: string, value: CircuitData, _keyName = 'id'): Promise<void> {
    Object.keys(value).map((circuitComponentKey) => {
      const storeKey = [CIRCUIT_DATA_KEY_PREFIX, key, circuitComponentKey].join(
        '_'
      )
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore because the key comes from the value object
      const data = value[circuitComponentKey] as Uint8Array | string | null
      if (data) {
        this.storage.set(storeKey, data)
      }
    })
    return Promise.resolve()
  }

  get(circuitKey: string, _keyName = 'id'): Promise<CircuitData | undefined> {
    const allKeys = this.storage.getAllKeys()

    const keys = allKeys.filter((key) => key.includes(circuitKey))
    if (keys.length === 0) {
      return Promise.resolve(undefined)
    }

    const dataElements = keys.map((key) => {
      const [keyName] = key.split('_').reverse()
      let data = null
      if (keyName === 'circuitId') {
        data = this.storage.getString(key)
      } else {
        data = this.storage.getBuffer(key) ?? null
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
}
