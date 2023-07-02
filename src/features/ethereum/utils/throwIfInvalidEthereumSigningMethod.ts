import { $enum } from 'ts-enum-util'

import { EthereumSigningMethod } from '../@types'

export const isValidEthereumSigningMethod = (
  maybeEthereumSigningMethod: string | undefined
): maybeEthereumSigningMethod is EthereumSigningMethod => {
  if (typeof maybeEthereumSigningMethod !== 'string') return false

  return [...$enum(EthereumSigningMethod).values()]
    .map(String)
    .includes(maybeEthereumSigningMethod)
}

export function throwIfInvalidEthereumSigningMethod(
  maybeEthereumSigningMethod: string | undefined
): maybeEthereumSigningMethod is EthereumSigningMethod {
  if (
    typeof maybeEthereumSigningMethod !== 'string' ||
    !maybeEthereumSigningMethod.length
  )
    throw new Error(
      `Expected non-empty string maybeEthereumSigningMethod, encountered "${String(
        maybeEthereumSigningMethod
      )}".`
    )

  if (!isValidEthereumSigningMethod(maybeEthereumSigningMethod))
    throw new Error(
      `"${maybeEthereumSigningMethod}" is not a valid ethereum signing method.`
    )

  return true
}
