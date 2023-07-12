import { $enum } from 'ts-enum-util'

import { EthereumRpcMethod } from '../@types'

export const isValidEthereumRpcMethod = (
  maybeEthereumSigningMethod: string | undefined
): maybeEthereumSigningMethod is EthereumRpcMethod => {
  if (typeof maybeEthereumSigningMethod !== 'string') return false

  return [...$enum(EthereumRpcMethod).values()]
    .map(String)
    .includes(maybeEthereumSigningMethod)
}

export function throwIfInvalidEthereumRpcMethod(
  maybeEthereumSigningMethod: string | undefined
): maybeEthereumSigningMethod is EthereumRpcMethod {
  if (
    typeof maybeEthereumSigningMethod !== 'string' ||
    !maybeEthereumSigningMethod.length
  )
    throw new Error(
      `Expected non-empty string maybeEthereumSigningMethod, encountered "${String(
        maybeEthereumSigningMethod
      )}".`
    )

  if (!isValidEthereumRpcMethod(maybeEthereumSigningMethod))
    throw new Error(
      `"${maybeEthereumSigningMethod}" is not a valid ethereum signing method.`
    )

  return true
}
