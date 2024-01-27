/**
 * Specific chain and network identifier matching the CAIP standard:
 *
 * - eip2551:1 = ethereum mainnet
 * - eip2551:4 = goerli testnet
 *
 * Use https://github.com/ChainAgnostic/caip-js
 */
import { AssetId } from 'caip'

/**
 * A blockchain network (ie: goerli)
 */
export interface BlockchainNetwork {
  asset: AssetId
  chainId: string
  namespace: string
  reference: string
  name: string
  label: string
  chainName: string
  symbol: string
  explorerURL: string
  confirmations: number
  isMainnet: boolean
  decimal: number
  icon: string
  slip44Reference: string
  derivationPath: string
  subcoinType: string
  rpcUrl: string
}

export interface BlockchainAccount {
  privateKey?: string
  address?: string
  publicKey?: string
  mnemonic?: string
  chainId?: string
  derivationPath?: string
  blockchainNetwork?: BlockchainNetwork
}

export type BlockchainAccounts = Record<
  // HACK: There are also some deprecated standards, such as algorand, which may
  //       appear in an instance of VeridaWalletAccounts. Please take
  //       "SupportedCaipProtocolStandard" with a grain of salt here.
  string,
  BlockchainAccount
>

/**
 * @todo improve typescript
 *
 * Represents a blockchain wallet that is saved into a users list of wallets
 *
 * A wallet may be
 * 1. multi-chain with a single mnemonic and no private key
 * 2. single chain with a single private key
 * 3. single chain with a single mnemonic
 *
 * Must have either (privateKey or mnemonic)
 */
export interface BlockchainWallet extends BlockchainAccount {
  _id: string
  label: string
  multiChain: boolean
  viewOnly?: boolean
  walletType: string // "multi" for a multi coin, otherwise the CAIP chain reference (ie: "eip155:5")
}

export interface BlockchainWalletWithAccounts extends BlockchainWallet {
  accounts: Record<string, BlockchainAccount>

  // Transient fields for displaying
  icon?: string
  count?: number
}
