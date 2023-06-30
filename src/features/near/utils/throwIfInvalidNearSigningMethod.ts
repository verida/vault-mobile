import { $enum } from 'ts-enum-util'

import { NearSigningMethod } from '../@types'

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

  const isValidSigningMethod = [...$enum(NearSigningMethod).values()]
    .map(String)
    .includes(maybeNearSigningMethod)

  if (!isValidSigningMethod)
    throw new Error(
      `"${maybeNearSigningMethod}" is not a valid near signing method.`
    )

  return isValidSigningMethod
}
