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

export const AddEthereumChainRequestParam = z
  .object({
    blockExplorerUrls: z.array(z.string().url()),
    chainId: z
      .string()
      .nonempty()
      // Ensure the chainId is a valid zero-prefixed hex value.
      .refine((value: string) => /^(0x|0X)[0-9A-Fa-f]+$/.test(value)),
    chainName: z.string().nonempty(),
    rpcUrls: z.array(z.string().url()).nonempty(),
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
