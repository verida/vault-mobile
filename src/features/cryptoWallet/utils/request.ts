import { AccountId, ChainId } from 'caip'
import { isSupportedCaipNamespace } from 'features/caip'
import {
  CryptoWalletRawRequest,
  CryptoWalletRequest,
} from 'features/cryptoWallet/@types'
import { SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES } from 'features/cryptoWallet/constants'
import { Logger } from 'features/telemetry'

import { BlockchainNetwork } from 'api/types'

// Request structure:
// <namespace>:[<prefix>-]<address>[@<chainId>][?<params>]
// Examples:
// ethereum:pay-0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@5?value=1e18
// ethereum:0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@5?value=0.84987325873e18&message=test
// eip155:pay-0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@80001?value=1e18
// eip155:0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@80001?value=1e18
// near:pay-3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18
// near:3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18

const logger = new Logger('Crypto Wallet')

export function isCryptoRequestDeepLink(url: string) {
  return isCryptoRequestUrl(url)
}

export function isCryptoRequestQrCode(qrCodeMessage: string) {
  return isCryptoRequestUrl(qrCodeMessage)
}

function isCryptoRequestUrl(url: string) {
  logger.debug('Checking if URL is a blockchain request', { url })
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
  logger.debug('parsing blockchain request URL', { url })
  // TODO: Extract transfers and additional params

  const regex =
    /^(?<namespace>\w+):(?<prefix>\w+-)?(?<address>\w+)@?(?<chainId>\w+)?\??(?<params>.+)?$/

  const match = url.match(regex)

  if (!match) {
    throw new Error('Invalid crypto request')
  }

  // Not extracting the prefix yet as it's only 'pay' for the now
  const { namespace, address, chainId, params } = match.groups!

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
    params: params ? Object.fromEntries(new URLSearchParams(params)) : {},
  }

  logger.debug('parsed blockchain request URL', { request })

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

  logger.debug('native asset', { asset: blockchainNetwork.asset })

  const nativeAsset = blockchainNetwork.asset

  const asset = nativeAsset // TODO: support other assets from the request

  return {
    action: request.action,
    blockchainNetwork,
    asset,
    recipientAccount,
    amount: request.params.value ? Number(request.params.value) : 0,
    // FIXME: using Number may not be the best, as amount is in the smallest atomic unit and noted like 1e18, so big numbers
  }
}
