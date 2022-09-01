import {
  IClientMeta,
  IJsonRpcRequest,
  IWalletConnectSession,
} from '@walletconnect/types'
import { SessionTypes, SignClientTypes } from '@walletconnect/typesv2'

export interface DApp {
  walletId: string
  session: IWalletConnectSession
  accounts?: string[]
  chainId?: number
  chain?: 'algo' | 'ethr' | 'near' | undefined // TODO: add other networks
}

export interface DAppv2 {
  walletId: string
  id: number
  topic: string
  metadata: SignClientTypes.Metadata
  namespaces: SessionTypes.Namespaces
  relayProtocol: string
}

export type WalletConnectSession = IWalletConnectSession

export type WalletConnectClientMeta = IClientMeta

export type WalletConnectRequest = IJsonRpcRequest

export interface IAssetData {
  symbol: string
  name: string
  decimals: string
  contractAddress: string
  balance?: string
}

export interface IChainData {
  name: string
  short_name: string
  chain: string
  network: string
  chain_id: number
  network_id: number
  rpc_url: string
  native_currency: IAssetData
}

export interface ITxData {
  from: string
  to: string
  nonce: string
  gasPrice: string
  gasLimit: string
  value: string
  data: string
}

export interface IBlockScoutTx {
  value: string
  txreceipt_status: string
  transactionIndex: string
  to: string
  timeStamp: string
  nonce: string
  isError: string
  input: string
  hash: string
  gasUsed: string
  gasPrice: string
  gas: string
  from: string
  cumulativeGasUsed: string
  contractAddress: string
  confirmations: string
  blockNumber: string
  blockHash: string
}

export interface IBlockScoutTokenTx {
  value: string
  transactionIndex: string
  tokenSymbol: string
  tokenName: string
  tokenDecimal: string
  to: string
  timeStamp: string
  nonce: string
  input: string
  hash: string
  gasUsed: string
  gasPrice: string
  gas: string
  from: string
  cumulativeGasUsed: string
  contractAddress: string
  confirmations: string
  blockNumber: string
  blockHash: string
}

export interface IParsedTx {
  timestamp: string
  hash: string
  from: string
  to: string
  nonce: string
  gasPrice: string
  gasUsed: string
  fee: string
  value: string
  input: string
  error: boolean
  asset: IAssetData
  operations: ITxOperation[]
}

export interface ITxOperation {
  asset: IAssetData
  value: string
  from: string
  to: string
  functionName: string
}

export interface IGasPricesResponse {
  fastWait: number
  avgWait: number
  blockNum: number
  fast: number
  fastest: number
  fastestWait: number
  safeLow: number
  safeLowWait: number
  speed: number
  block_time: number
  average: number
}

export interface IGasPrice {
  time: number
  price: number
}

export interface IEtherPrice {
  USD: number
}

export interface IGasPrices {
  timestamp: number
  slow: IGasPrice
  average: IGasPrice
  fast: IGasPrice
}

export interface IMethodArgument {
  type: string
}

export interface IMethod {
  signature: string
  name: string
  args: IMethodArgument[]
}

export interface IRequestRenderParams {
  label: string
  value: string
}

export interface IRpcEngine {
  filter: (payload: IJsonRpcRequest) => boolean
  router: (payload: IJsonRpcRequest, state: any) => Promise<void>
  render: (payload: IJsonRpcRequest) => IRequestRenderParams[]
  signer: (payload: IJsonRpcRequest, state: any, dapp?: DApp) => Promise<void>
}

export interface WalletConnectEvents {
  init: (state: any, setState: any) => Promise<void>
  update: (state: any, setState: any) => Promise<void>
}

/**
 * Options for creating and using a multisignature account.
 */
export interface MultisigMetadata {
  /**
   * Multisig version.
   */
  version: number

  /**
   * Multisig threshold value. Authorization requires a subset of
   * signatures, equal to or greater than the threshold value.
   */
  threshold: number

  /**
   * List of Algorand addresses of possible signers for this
   * multisig. Order is important.
   */
  addrs: string[]
}

export interface WalletTransaction {
  /**
   * Base64 encoding of the canonical msgpack encoding of a
   * Transaction.
   */
  txn: string

  /**
   * Optional authorized address used to sign the transaction when
   * the account is rekeyed. Also called the signor/sgnr.
   */
  authAddr?: string

  /**
   * Optional multisig metadata used to sign the transaction
   */
  msig?: MultisigMetadata

  /**
   * Optional list of addresses that must sign the transactions
   */
  signers?: string[]

  /**
   * Optional message explaining the reason of the transaction
   */
  message?: string
}

export interface WalletConnectConfig {
  name: string
  logo: string
  chainId: number
  derivationPath: string
  chains: IChainData[]
  styleOpts: {
    showPasteUri: boolean
    showVersion: boolean
  }
  rpcEngine: IRpcEngine
  events: WalletConnectEvents
}

export interface SignTxnOpts {
  /**
   * Optional message explaining the reason of the group of
   * transactions.
   */
  message?: string

  // other options may be present, but are not standard
}

export type SignTxnParams = [WalletTransaction[], SignTxnOpts?]
