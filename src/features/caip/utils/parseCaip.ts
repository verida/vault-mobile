import { ParsedCaipType } from '../@types'
import { isSupportedCaipStandard } from './isSupportedCaipStandard'

export function maybeParseCaip(
  value: string | null | undefined
): ParsedCaipType | undefined {
  if (typeof value !== 'string' || !value.length || !value.includes(':'))
    return undefined

  const [standard, chainId, maybeAddress] = value.split(':')

  if (!isSupportedCaipStandard(standard)) return undefined

  if (!chainId.length) return undefined

  return { standard, chainId, address: maybeAddress }
}

// TODO: Add a protocol enum and have the codebase evaluate support.
export function parseCaipOrThrow(value: string | null | undefined) {
  const maybeParsedCaip: ParsedCaipType | undefined = maybeParseCaip(value)

  if (!maybeParsedCaip)
    throw new Error(`Value "${String(value)}" is not a valid caip identifier.`)

  return maybeParsedCaip
}
