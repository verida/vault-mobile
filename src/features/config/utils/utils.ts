import { isEmpty, isEqual } from 'lodash'

/**
 * Custom comparing function for app config
 * Only compare first level values of two objects
 */
export function compareAppConfig(
  configA: Record<string, any> | null,
  configB: Record<string, any> | null
) {
  if (isEmpty(configA) || isEmpty(configB)) return false

  for (const [key, value] of Object.entries(configA!)) {
    if (!isEqual(configB![key], value)) {
      return false
    }
  }

  return true
}
