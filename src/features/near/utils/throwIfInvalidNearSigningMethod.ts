import { $enum } from 'ts-enum-util'

import { NearSigningMethod } from '../@types'

export const isValidNearSigningMethod = (
  maybeNearSigningMethod: string | undefined
): maybeNearSigningMethod is NearSigningMethod => {
  if (typeof maybeNearSigningMethod !== 'string') return false

  return [...$enum(NearSigningMethod).values()]
    .map(String)
    .includes(maybeNearSigningMethod)
}

export function throwIfInvalidNearSigningMethod(
  maybeNearSigningMethod: string | undefined
): maybeNearSigningMethod is NearSigningMethod {
  if (
    typeof maybeNearSigningMethod !== 'string' ||
    !maybeNearSigningMethod.length
  )
    throw new Error(
      `Expected non-empty string maybeNearSigningMethod, encountered "${String(
        maybeNearSigningMethod
      )}".`
    )

  if (!isValidNearSigningMethod(maybeNearSigningMethod))
    throw new Error(
      `"${maybeNearSigningMethod}" is not a valid near signing method.`
    )

  return true
}
