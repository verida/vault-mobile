import { AccountId, AssetId, ChainId } from 'caip'
import { isSupportedCaipNamespace } from 'features/caip'
import {
  CryptoWalletRawRequest,
  CryptoWalletRequest,
} from 'features/cryptoWallet/@types'
import { SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES } from 'features/cryptoWallet/constants'

import { BlockchainNetwork } from 'api/types'

// Request structure:
// <namespace>:[<prefix>-]<address>[@<chainId>][?<params>]
//
// Ethereum
// ethereum:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=1e18
// ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=0.01e18&message=Hey%20Jim!%20Just%20reminding%20you%20owe%20me%205%20USDC%20for%20that%20lunch
//
// USDC on Goerli
// ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e18&message=Hey%20Jim!%20Just%20reminding%20you%20owe%20me%205%20USDC%20for%20that%20lunch
//
// Polygon
// eip155:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@80001?value=1e18
// eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@80001?value=0.01e18
//
// NEAR
// near:pay-3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18
// near:3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18
//
// Invalid
// cosmos-hub:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@567/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e18
//
// eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@567/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e18
//
// ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f
//
// ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5a18
//
// ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa38f&uint256=5e18
//

export function isCryptoRequestDeepLink(url: string) {
  return isCryptoRequestUrl(url)
}

export function isCryptoRequestQrCode(qrCodeMessage: string) {
  return isCryptoRequestUrl(qrCodeMessage)
}

function isCryptoRequestUrl(url: string) {
  return SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES.some((namespace) =>
    url.startsWith(`${namespace}:`)
  )
}

export function parseCryptoRequestDeepLink(url: string) {
  return parseCryptoRequest(url)
}

export function parseCryptoRequestQrCode(qrCodeMessage: string) {
  return parseCryptoRequest(qrCodeMessage)
}

function parseCryptoRequest(url: string): CryptoWalletRawRequest {
  // <namespace>:[<prefix>-]<address>[@<chainId>][/<function>][?<params>]

  const regex =
    /^(?<namespace>\w+):(?<prefix>\w+-)?(?<address>\w+)@?(?<chainId>\w+)?\/?(?<functionName>\w+)?\??(?<params>.+)?$/

  const match = url.match(regex)

  if (!match) {
    throw new Error('Invalid crypto request')
  }

  // Not extracting the prefix yet as it's only 'pay' for the now
  const { namespace, address, chainId, functionName, params } = match.groups!

  if (!namespace) {
    throw new Error('Crypto request is missing the blockchain namespace')
  }

  // EIP-681 uses ethereum as namespace, but we use eip155 instead
  const chainNamespace = namespace === 'ethereum' ? 'eip155' : namespace

  if (!isSupportedCaipNamespace(chainNamespace)) {
    throw new Error('Crypto request has unsupported blockchain namespace')
  }

  if (!address) {
    throw new Error('Crypto request is missing the address')
  }

  // chainId can be omited for ethereum mainnet in EIP-681, it should be present in other cases
  const chainReference = chainId
    ? chainId
    : namespace === 'ethereum'
    ? '1'
    : undefined

  if (!chainReference) {
    throw new Error('Crypto request is missing the chain reference')
  }

  const request: CryptoWalletRawRequest = {
    chainNamespace,
    chainReference,
    action: 'pay',
    address,
    function: functionName === 'transfer' ? 'transfer' : undefined,
    params: params ? Object.fromEntries(new URLSearchParams(params)) : {},
  }

  return request
}

export function processCryptoRequest(
  request: CryptoWalletRawRequest,
  blockchainNetworks: Record<string, BlockchainNetwork>
): CryptoWalletRequest {
  const chain = new ChainId({
    namespace: request.chainNamespace,
    reference: request.chainReference,
  })

  const blockchainNetwork = Object.values(blockchainNetworks).find(
    (network) => network.chainId === chain.toString()
  )

  if (!blockchainNetwork) {
    throw new Error('Unknown blockchain network')
  }

  const recipientAccount = new AccountId({
    chainId: chain,
    address: request.address,
  })

  const nativeAsset = blockchainNetwork.asset

  const asset =
    request.function === 'transfer' && request.params.address
      ? new AssetId({
          chainId: chain,
          assetName: {
            namespace: chain.namespace === 'eip155' ? 'ERC20' : 'NEP141', // TODO: Find a better way to determine the asset namespace based on the blockchain. Note that EIP-681 doesn't provide the information, so have to assume that it's ERC-20 or NEP-141
            reference: request.params.address,
          },
          tokenId: '1',
        })
      : nativeAsset

  return {
    action: request.action,
    blockchainNetwork,
    asset,
    recipientAccount,
    amount: request.params.value
      ? Number(request.params.value)
      : request.params.uint256
      ? Number(request.params.uint256)
      : 0,
    // FIXME: using Number may not be the best, as amount is in the smallest atomic unit and noted like 1e18, so big numbers
  }
}
