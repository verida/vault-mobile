import { AssetId, ChainId } from 'caip'
import { z } from 'zod'

import {
  BlockchainExplorerSchema,
  CustomBlockchainSchema,
  LegacyBlockchainSchema,
} from '../schemas'

export type BlockchainExplorer = z.infer<typeof BlockchainExplorerSchema>

export type ChainMetadata = z.infer<typeof LegacyBlockchainSchema>

export type UseChainMetadataState = {
  readonly loading: boolean
  readonly result?: ChainMetadata[]
  readonly error?: Error
}

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

export interface WalletUtilsWallet {
  chain: string
  mnemonic: string
  privateKey: string
  publicKey: string
  did: string
  address: string
}

export interface IBlockchain {
  buildAccountFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    multiChain: boolean
  ): WalletUtilsWallet

  buildAccountFromPrivateKey(privateKey: string): WalletUtilsWallet
}

// ------ Custom blockchain

export type CustomBlockchain = z.infer<typeof CustomBlockchainSchema>

export type AddCustomBlockchainsParams = {
  readonly blockchains: readonly ChainMetadata[]
  readonly reset?: boolean
}

export type RemoveCustomBlockchainsParams = {
  readonly chainIds: readonly ChainId[]
}
