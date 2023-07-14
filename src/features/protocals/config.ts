import { PolygonIdProtocalHandler } from './polygonid'
import { configProtocalHandlers } from './registry'

console.log('Config protocal handlers ')
// Config default handlers
configProtocalHandlers([
  new PolygonIdProtocalHandler(),
  // Other protocal handlers
])
