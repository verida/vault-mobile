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
  _id: string
  type: string
  seedPhrase: string
  label: string
  accounts: [AccountsType]
  chain?: string
}

export type WalletItem = {
  _id: string
  count: number
  icon: string
  label: string
  other?: any
  address?: string
  viewOnly?: boolean
}
