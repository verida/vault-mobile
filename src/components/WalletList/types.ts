//@deprecated should be types from features/cryptoWallet
export type SingleAccountType = {
  mnemonic: string
  privateKey: string
  publicKey: string
  address: string
}

//@deprecated
export type AccountsType = {
  [key: string]: SingleAccountType
}

//@deprecated
export type WalletType = {
  _id: string
  type: string
  seedPhrase: string
  label: string
  accounts: [AccountsType]
  chain?: string
}

//@deprecated
export type WalletItem = {
  _id: string
  count: number
  icon: string
  label: string
  other?: any
  address?: string
  viewOnly?: boolean
}
