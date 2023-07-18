import { $enum } from 'ts-enum-util'

import { NearRpcMethod } from '../@types'

export const isValidNearRpcMethod = (
  maybeNearRpcMethod: string | undefined
): maybeNearRpcMethod is NearRpcMethod => {
  if (typeof maybeNearRpcMethod !== 'string') return false

  return [...$enum(NearRpcMethod).values()]
    .map(String)
    .includes(maybeNearRpcMethod)
}

export function throwIfInvalidNearRpcMethod(
  maybeNearRpcMethod: string | undefined
): maybeNearRpcMethod is NearRpcMethod {
  if (typeof maybeNearRpcMethod !== 'string' || !maybeNearRpcMethod.length)
    throw new Error(
      `Expected non-empty string maybeNearRpcMethod, encountered "${String(
        maybeNearRpcMethod
      )}".`
    )

  if (!isValidNearRpcMethod(maybeNearRpcMethod))
    throw new Error(`"${maybeNearRpcMethod}" is not a valid near RPC method.`)

  return true
}
