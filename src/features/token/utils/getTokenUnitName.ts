import {
  SelectSingleTokenData,
  SupportedTokenObject,
  WithMaybeTokenType,
} from 'features/cryptoWallet'

export function getTokenUnitName(
  // TODO: There is some overlap between SelectSingleTokenData and SupportedTokenObject which is currently difficult to infer.
  token: WithMaybeTokenType<SelectSingleTokenData | SupportedTokenObject>
): string {
  const { tokenType, ...extras } = token

  if (typeof tokenType === 'string' && tokenType.length) return tokenType

  if ('symbol' in extras) {
    const maybeSymbol = extras.symbol

    if (typeof maybeSymbol === 'string' && maybeSymbol.length)
      return maybeSymbol
  }

  return 'Token'
}
