export type VeridaWalletType = 'single' | 'multi'
export type CaipWalletType = 'eip155' | 'algorand' | 'near'

// TODO: @cawfree where you introduced privateKey, you were likely interacting with a VeridaWallet, double check this
export interface VeridaWalletAccount {
  address: string
  chain: string
  did?: string
  mnemonic: string
  privateKey: string
  publicKey: string
}

export type VeridaWalletAccounts = Record<CaipWalletType, VeridaWalletAccount>

export interface VeridaWallet {
  label: string
  privateKey: string
  seedPhrase: string
  type: VeridaWalletType
  accounts: VeridaWalletAccounts
}
