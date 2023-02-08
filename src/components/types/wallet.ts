export type VeridaWalletType = 'single' | 'multi'
export type CaipWalletType = 'eip155' | 'algorand' | 'near'

export interface VeridaWalletAccount {
  address: string
  chain: string
  did?: string
  mnemonic: string
  privateKey: string
  publicKey: string
}

export interface VeridaWallet {
  label: string
  privateKey: string
  seedPhrase: string
  type: VeridaWalletType
  accounts: Record<CaipWalletType, VeridaWalletAccount>
}
