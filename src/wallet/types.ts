import { AccountId, AssetType } from 'caip'

export type Address = string

export type Transaction = {
  id: string
  from: AccountId.AccountIdParams
  to: AccountId.AccountIdParams
  amount: number
  fees: number
  token: AssetType.AssetTypeParams
}

export type TokenPrice = {
  price: number
  token: AssetType.AssetTypeParams
}

export type TokenBalance = {
  quantity: number
  token: AssetType.AssetTypeParams
}

export type TokenWithBalanceAndPrice = {
  token: AssetType.AssetTypeParams
  quantity: number
  price: number
}
