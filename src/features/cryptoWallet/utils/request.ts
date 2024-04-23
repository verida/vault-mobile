import { AccountId, AssetId, ChainId } from 'caip'

import { ChainMetadatas, isSupportedCaipNamespace } from '~/features/caip'

import { SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES } from '../constants'
import {
  CryptoWalletRawRequest,
  CryptoWalletRequest,
  ResourceParams,
} from '../types'

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

  if (!match) throw new Error('Invalid crypto request')

  // Not extracting the prefix yet as it's only 'pay' for the now
  const { namespace, address, chainId, functionName, params } = match.groups!

  if (!namespace) {
    throw new Error('Crypto request is missing the blockchain namespace')
  }

  // EIP-681 uses ethereum as namespace, but we use eip155 instead
  const chainNamespace = namespace === 'ethereum' ? 'eip155' : namespace

  if (!isSupportedCaipNamespace(chainNamespace))
    throw new Error('Crypto request has unsupported blockchain namespace')

  if (!address) throw new Error('Crypto request is missing the address')

  // chainId can be omited for ethereum mainnet in EIP-681, it should be present in other cases
  const chainReference = chainId
    ? chainId
    : namespace === 'ethereum'
      ? '1'
      : undefined

  if (!chainReference)
    throw new Error('Crypto request is missing the chain reference')

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

export function processCryptoRequest({
  request,
  chainMetadatas,
}: {
  readonly request: CryptoWalletRawRequest
  readonly chainMetadatas: ChainMetadatas
}): CryptoWalletRequest {
  const chain = new ChainId({
    namespace: request.chainNamespace,
    reference: request.chainReference,
  })

  const maybeChainMetadata = chainMetadatas.find(
    (e) =>
      e.namespace === request.chainNamespace &&
      e.reference === request.chainReference
  )

  if (!maybeChainMetadata) throw new Error('Unknown blockchain network')

  const recipientAccount = new AccountId({
    chainId: chain,
    address: request.address,
  })

  const resource: ResourceParams =
    request.function === 'transfer' && request.params.address
      ? // TODO: NEP141
        // TODO: extract this
        new AssetId({
          chainId: chain,
          assetName: {
            namespace: chain.namespace === 'eip155' ? 'ERC20' : 'NEP141', // TODO: Find a better way to determine the asset namespace based on the blockchain. Note that EIP-681 doesn't provide the information, so have to assume that it's ERC-20 or NEP-141
            reference: request.params.address,
          },
          tokenId: '1',
        })
      : chain

  return {
    action: request.action,
    //chainMetadata: maybeChainMetadata,
    resource,
    recipientAccount,
    amount: request.params.value
      ? Number(request.params.value)
      : request.params.uint256
        ? Number(request.params.uint256)
        : // HACK: It is technically invalid not to specify an amount to send.
          //       We expect such declarations to be processed by downstream
          //       handlers - it is subjective whether the reciever decides
          //       whether to fall back to a zero amount, or to regard the
          //       amount supplied as invalid.
          undefined,
    // FIXME: using Number may not be the best, as amount is in the smallest atomic unit and noted like 1e18, so big numbers
  }
}
