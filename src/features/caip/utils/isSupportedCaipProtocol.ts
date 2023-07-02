import { SupportedCaipProtocol } from 'types'

export function isSupportedCaipProtocol(
  maybeSupportedCaipProtocol: string | undefined
): maybeSupportedCaipProtocol is SupportedCaipProtocol {
  if (!maybeSupportedCaipProtocol) return false

  // TODO: use an enum for CaipWalletType so we can iterate these conditions
  //       instead of manually maintain them
  return (
    maybeSupportedCaipProtocol === 'eip155' ||
    maybeSupportedCaipProtocol === 'near'
  )
}
