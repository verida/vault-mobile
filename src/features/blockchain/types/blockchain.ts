import { ChainId } from 'caip'
import { z } from 'zod'

import {
  BlockchainExplorerSchema,
  CustomBlockchainSchema,
  LegacyBlockchainSchema,
} from '../schemas'

export type BlockchainExplorer = z.infer<typeof BlockchainExplorerSchema>

export type Blockchain = z.infer<typeof LegacyBlockchainSchema>

export type UseChainMetadataState = {
  readonly loading: boolean
  readonly result?: Blockchain[]
  readonly error?: Error
}

/**
 * @deprecated use `Blockchain` instead
 */
export interface LegacyBlockchain {
  chainId: string
  namespace: string
  reference: string
  label: string
  symbol: string
  explorerURL: string
  isMainnet: boolean
  decimal: number
  icon: string
  derivationPath: string
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
  readonly blockchains: readonly Blockchain[]
  readonly reset?: boolean
}

export type RemoveCustomBlockchainsParams = {
  readonly chainIds: readonly ChainId[]
}
