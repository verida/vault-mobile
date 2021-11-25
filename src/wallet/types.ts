import { AccountId, AssetType } from 'caip'

export type Address = string

// export type Token = {
//   name: string
//   symbol: string
//   logo: string
//   address: Address
// }

export type Transaction = {
  id: string
  from: AccountId.AccountIdParams
  to: AccountId.AccountIdParams
  amount: number
  fees: number
  token: AssetType.AssetTypeParams
}
