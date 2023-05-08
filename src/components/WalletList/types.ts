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
  viewOnly?: boolean
}
