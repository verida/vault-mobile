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

export type WalletItemProps = {
  count: number
  icon: Element
  id: string
  label: string
  other?: any
}
