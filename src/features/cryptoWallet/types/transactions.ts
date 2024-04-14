export enum TransactionType {
  SENT = 'sent',
  RECEIVED = 'received',
}

export interface Transaction {
  id: string
  type: TransactionType
  address: string
  quantity: bigint
  pending: boolean
}

export interface DetailedTransaction {
  id: string
  type: string
  address: string
  quantity: bigint
  pending: boolean
  fee: string
  feeDecimal: number
  feeSymbol: string
  blockNumber: string
  time: string
}
