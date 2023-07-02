import { EnvironmentType } from '@verida/types'

// TODO: This is not multichain friendly. Make this a function of the full chain
//       enumerated id.
export function getSupportedCaipProtocolFriendlyName(
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
