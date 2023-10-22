import { ethers } from 'ethers'
import { BlockchainRequestHandlers } from 'features/blockchain/@types'
import { z } from 'zod'

// https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-v2/src/data/EIP155Data.ts#L95
export enum Eip155RpcMethod {
  PERSONAL_SIGN = 'personal_sign',
  ETH_SIGN = 'eth_sign',
  ETH_SIGN_TRANSACTION = 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA = 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3 = 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
  ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
  ETH_SEND_TRANSACTION = 'eth_sendTransaction',
  ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
}

export const AddEthereumChainRequestParamRpcUrls = z
  .array(z.string().url())
  .nonempty()

export const AddEthereumChainRequestParamBlockExplorerUrls = z.array(
  z.string().url()
)

export const AddEthereumChainRequestParam = z
  .object({
    blockExplorerUrls: AddEthereumChainRequestParamBlockExplorerUrls,
    chainId: z
      .string()
      .nonempty()
      // Ensure the chainId is a valid zero-prefixed hex value.
      .refine((value: string) => /^(0x|0X)[0-9A-Fa-f]+$/.test(value)),
    chainName: z.string().nonempty(),
    rpcUrls: AddEthereumChainRequestParamRpcUrls,
    nativeCurrency: z.object({
      name: z.string().nonempty(),
      symbol: z.string().nonempty(),
    }),
  })
  .passthrough()

export type AddEthereumChainRequestParam = z.infer<
  typeof AddEthereumChainRequestParam
>

export const AddEthereumChainRequestParams = z
  .array(AddEthereumChainRequestParam)
  .nonempty()

export type AddEthereumChainRequestParams = z.infer<
  typeof AddEthereumChainRequestParams
>

const ChainListMiniItemNativeCurrency = z.object({
  name: z.string().nonempty(),
  symbol: z.string().nonempty(),
  decimals: z.number(),
})

const ChainsListExplorer = z
  .object({
    name: z.string(),
    url: z.string().url(),
    standard: z.string(),
  })
  .passthrough()

const ChainsListExplorers = z.array(ChainsListExplorer)

export const ChainListItem = z
  .object({
    name: z.string().nonempty(),
    chainId: z.number(),
    nativeCurrency: ChainListMiniItemNativeCurrency,
    rpc: z.array(z.string().url()),
    explorers: ChainsListExplorers.optional(),
  })
  .passthrough()

export type ChainsListItem = z.infer<typeof ChainListItem>

export const ChainsList = z.array(ChainListItem).nonempty()

export type ChainsList = z.infer<typeof ChainsList>

export type BlockchainRequestHandlersEip155 = BlockchainRequestHandlers<
  Eip155RpcMethod,
  ethers.Wallet
>
