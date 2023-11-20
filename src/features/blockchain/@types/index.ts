import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { z } from 'zod'

export * from './enums'

export type BlockchainRequestHandlerCallbackParams<Context> = {
  readonly params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
  readonly context: Context
}

export type BlockchainRequestHandlerCallback<Context> = (
  params: BlockchainRequestHandlerCallbackParams<Context>
) => Promise<unknown>

export type BlockchainRequestHandlers<
  T extends string | number | symbol,
  Context
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
