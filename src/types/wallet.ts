export type VeridaWalletType = 'single' | 'multi'
// TODO: @cawfree, experiment with removing
export type SupportedCaipProtocol = 'eip155' | 'near'

// TODO: @cawfree where you introduced privateKey, you were likely interacting with a VeridaWallet, double check this
export interface VeridaWalletAccount {
  address: string
  chain: string
  did?: string
  mnemonic: string
  privateKey: string
  publicKey: string
}

export type VeridaWalletAccounts = Record<
  SupportedCaipProtocol,
  VeridaWalletAccount
>

export interface VeridaWallet {
  label: string
  privateKey: string
  seedPhrase: string
  type: VeridaWalletType
  accounts: VeridaWalletAccounts
}
