export type SingleAccountType = {
  mnemonic: string
  privateKey: string
  publicKey: string
  address: string
}

export type AccountsType = {
  [key: string]: SingleAccountType
}

export type WalletType = {
  id: string
  type: string
  seedPhrase: string
  label: string
  accounts: [AccountsType]
  chain?: string
}

export type WalletItem = {
  count: number
  icon: string
  id: string
  label: string
  other?: any
  address?: string
}

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
