import { ParsedCaipType } from 'features/caip/@types'

export function maybeParseCaip(
  value: string | null | undefined
): ParsedCaipType | undefined {
  if (typeof value !== 'string' || !value.length || !value.includes(':'))
    return undefined

  const [protocol, chainId, ...extras] = value.split(':')

  if (extras.length) return undefined

  if (!protocol.length || !chainId.length) return undefined

  return { protocol, chainId }
}

export function parseCaipOrThrow(value: string | null | undefined) {
  const maybeParsedCaip: ParsedCaipType | undefined = maybeParseCaip(value)

  if (!maybeParsedCaip)
    throw new Error(`Value "${String(value)}" is not a valid caip identifier.`)

  return maybeParsedCaip
}
