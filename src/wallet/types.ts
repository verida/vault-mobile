export type Address = string

export type Token = {
  name: string
  symbol: string
  logo: string
  address: Address
  chain: string
}

export type Transaction = {
  id: string
  from: Address
  to: Address
  amount: number
  fees: number
  token: Token
}
