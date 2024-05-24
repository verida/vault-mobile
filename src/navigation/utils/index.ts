import { navigationRef } from '../config'
import { MainStackParams } from '../types'

export function navigate<T extends keyof MainStackParams>(
  name: T,
  params: MainStackParams[T]
) {
  if (navigationRef.isReady()) {
    // Has type issues, but works
    navigationRef.navigate(name as any, params as any)
  }
}
