import { ParsedCaipType } from '../@types'
import { isSupportedCaipNamespace } from './isSupportedCaipNamespace'

export function maybeParseCaip(
  value: string | null | undefined
): ParsedCaipType | undefined {
  if (typeof value !== 'string' || !value.length || !value.includes(':'))
    return undefined

  const [namespace, reference, maybeAddress] = value.split(':')

  if (!isSupportedCaipNamespace(namespace)) return undefined

  if (!reference.length) return undefined

  return { namespace, reference, address: maybeAddress }
}

// TODO: Add a protocol enum and have the codebase evaluate support.
export function parseCaipOrThrow(value: string | null | undefined) {
  const maybeParsedCaip: ParsedCaipType | undefined = maybeParseCaip(value)

  if (!maybeParsedCaip)
    throw new Error(`Value "${String(value)}" is not a valid caip identifier.`)

  return maybeParsedCaip
}
