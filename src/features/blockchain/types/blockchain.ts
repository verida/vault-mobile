import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { AssetId } from 'caip'
import { z } from 'zod'

import { SupportedBlockchainNamespace } from './enums'

export const ChainMetadataBlockExplorerUrl = z.string().url()

export const ChainMetadataBlockExplorer = z.object({
  name: z.string().or(z.null()).optional(),
  url: ChainMetadataBlockExplorerUrl,
  standard: z.string().or(z.null()).optional(),
})

export type ChainMetadataBlockExplorer = z.infer<
  typeof ChainMetadataBlockExplorer
>

export const ChainMetadataBlockExplorers = z.array(ChainMetadataBlockExplorer)

export type ChainMetadataBlockExplorers = z.infer<
  typeof ChainMetadataBlockExplorers
>

export const ChainMetadataRpc = z.string().url()

export type ChainMetadataRpc = z.infer<typeof ChainMetadataRpc>

export const ChainMetadataRpcs = z.array(ChainMetadataRpc).nonempty()

export type ChainMetadataRpcs = z.infer<typeof ChainMetadataRpcs>

export const ChainMetadataSchema = z
  .object({
    name: z.string().nonempty(),
    rpcUrls: ChainMetadataRpcs,
    namespace: z.nativeEnum(SupportedBlockchainNamespace),
    reference: z.string().nonempty(),
    decimals: z.number().positive(),
    isMainnet: z.boolean().or(z.null()),
    nativeCurrencyName: z.string().nonempty(),
    symbol: z.string().nonempty(),
    icon: z.string().url().or(z.null()),
    blockExplorers: ChainMetadataBlockExplorers,
  })
  .passthrough()

export type ChainMetadata = z.infer<typeof ChainMetadataSchema>

// A list of ChainMetadata. Note - this may contain duplicate configuration settings,
// for example, a custom Ethereum Mainnet configuration and the default Ethereum Mainnet
// configuration.
export type ChainMetadatas = readonly ChainMetadata[]

export type UseChainMetadataState = {
  readonly loading: boolean
  readonly result?: ChainMetadatas
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

export type BlockchainRequestHandlerCallbackParams<Context> = {
  readonly params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
  readonly context: Context
  chainId?: string
}

export type BlockchainRequestHandlerCallback<Context> = (
  params: BlockchainRequestHandlerCallbackParams<Context>
) => Promise<unknown>

export type BlockchainRequestHandlers<
  T extends string | number | symbol,
  Context,
> = {
  readonly [key in T]: BlockchainRequestHandlerCallback<Context>
}
