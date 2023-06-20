// TODO: these will change depending whether we're on testnet or not
export function getCaipWalletTypeFriendlyName(
  caipWalletType: string | undefined
): string {
  return caipWalletType === 'eip155'
    ? 'Ethereum Goerli'
    : caipWalletType === 'algorand'
    ? 'Algorand Testnet'
    : caipWalletType === 'near'
    ? 'Near Testnet'
    : 'Unknown'
}
