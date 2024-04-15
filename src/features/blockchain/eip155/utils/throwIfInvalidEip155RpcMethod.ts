import { $enum } from 'ts-enum-util'

import { Eip155RpcMethod } from '../types'

export const isValidEip155RpcMethod = (
  maybeEip155RpcMethod: string | undefined
): maybeEip155RpcMethod is Eip155RpcMethod => {
  if (typeof maybeEip155RpcMethod !== 'string') return false

  return [...$enum(Eip155RpcMethod).values()]
    .map(String)
    .includes(maybeEip155RpcMethod)
}

export function throwIfInvalidEip155RpcMethod(
  maybeEip155RpcMethod: string | undefined
): maybeEip155RpcMethod is Eip155RpcMethod {
  if (typeof maybeEip155RpcMethod !== 'string' || !maybeEip155RpcMethod.length)
    throw new Error(
      `Expected non-empty string maybeEip155RpcMethod, encountered "${String(
        maybeEip155RpcMethod
      )}".`
    )

  if (!isValidEip155RpcMethod(maybeEip155RpcMethod))
    throw new Error(
      `"${maybeEip155RpcMethod}" is not a valid ethereum signing method.`
    )

  return true
}
