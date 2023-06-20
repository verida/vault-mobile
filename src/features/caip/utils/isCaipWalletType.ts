import { CaipWalletType } from 'types'

export function isCaipWalletType(
  maybeCaipWalletType: string
): maybeCaipWalletType is CaipWalletType {
  // TODO: use an enum for CaipWalletType so we can iterate these conditions
  //       instead of manually maintain them
  return (
    maybeCaipWalletType === 'eip155' ||
    maybeCaipWalletType === 'algorand' ||
    maybeCaipWalletType === 'near'
  )
}
