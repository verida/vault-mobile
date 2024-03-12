import { CircuitId, CircuitStorage } from '@0xpolygonid/js-sdk'

import { PolygonIdCircuitDataSource } from './PolygonIdCircuitDataSource'

export class PolygonIdCircuitStorage extends CircuitStorage {
  constructor(private readonly dataSource: PolygonIdCircuitDataSource) {
    super(dataSource)
  }

  checkCircuitDataExists(circuitId: CircuitId) {
    return this.dataSource.exists(circuitId)
  }
}
