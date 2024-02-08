import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { AssetId } from 'caip'
import { ChainMetadata } from 'features/caip'
import { z } from 'zod'

export * from './enums'

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

// eslint-disable-next-line @typescript-eslint/ban-types
export type BlockchainContextValue = {}

const CustomBlockchainNetworkLabel = z.string()

const CustomBlockchainNetworkRpcUrls = z.array(z.string().url()).nonempty()

const CustomBlockchainNetworkChainId = z.object({
  namespace: z.string(),
  reference: z.string(),
})

const CustomBlockchainNetworkIsMainnet = z.boolean().or(z.null())

const CustomBlockchainNetworkNativeCurrency = z.object({
  decimals: z.number().int().positive(),
  label: CustomBlockchainNetworkLabel,
  symbol: z.string(),
})

const CustomBlockchainNetworkBlockExplorer = z.object({
  label: CustomBlockchainNetworkLabel.or(z.null()).optional(),
  url: z.string().url(),
  standard: z.string().or(z.null()).optional(),
})

const CustomBlockchainNetworkBlockExplorers = z.array(
  CustomBlockchainNetworkBlockExplorer
)

const CustomBlockchainNetworkIcon = z.string().url().or(z.null())

export const CustomBlockchainNetwork = z.object({
  label: CustomBlockchainNetworkLabel,
  rpcUrls: CustomBlockchainNetworkRpcUrls,
  chainId: CustomBlockchainNetworkChainId,
  isMainnet: CustomBlockchainNetworkIsMainnet,
  nativeCurrency: CustomBlockchainNetworkNativeCurrency,
  blockExplorers: CustomBlockchainNetworkBlockExplorers,
  icon: CustomBlockchainNetworkIcon,
})

export type CustomBlockchainNetwork = z.infer<typeof CustomBlockchainNetwork>

export const BLOCKCHAIN_SLICE_NAME = 'blockchain'

export type CustomChains = {
  readonly loading: boolean
  readonly result: ChainMetadata[]
  readonly error?: Error
}
