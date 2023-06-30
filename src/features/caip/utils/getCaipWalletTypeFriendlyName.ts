import { EnvironmentType } from '@verida/types'

export function getCaipWalletTypeFriendlyName(
  caipWalletType: string | undefined,
  environmentType: EnvironmentType
): string {
  return caipWalletType === 'eip155'
    ? `Ethereum ${
        environmentType === EnvironmentType.MAINNET ? 'Mainnet' : 'Goerli'
      }`
    : caipWalletType === 'near'
    ? `Near ${
        environmentType === EnvironmentType.MAINNET ? 'Mainnet' : 'Testnet'
      }`
    : 'Unknown'
}
