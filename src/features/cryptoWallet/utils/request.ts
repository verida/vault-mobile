import { CryptoWalletRequest } from 'features/cryptoWallet/@types'
import { Logger } from 'features/telemetry'

const SUPPORTED_BLOCKCHAIN_NAMESPACE = ['eip155', 'near']
const SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES = [
  'ethereum',
  ...SUPPORTED_BLOCKCHAIN_NAMESPACE,
]

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

function parseCryptoRequest(url: string): CryptoWalletRequest {
  logger.debug('parsing blockchain request URL', { url })
  // Request structure:
  // <namespace>:[<prefix>-]<address>[@<chainId>][?<params>]
  // Examples:
  // ethereum:pay-0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@5?value=1e18
  // ethereum:0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@5?value=1e18
  // eip155:pay-0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@80001?value=1e18
  // eip155:0x3d6b0f6f0Fbaf8F947c020E53e3e5B9806eF1FFd@80001?value=1e18
  // near:pay-3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18
  // near:3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18

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

  const resolvedNamespace = namespace === 'ethereum' ? 'eip155' : namespace

  if (!SUPPORTED_BLOCKCHAIN_NAMESPACE.includes(resolvedNamespace)) {
    throw new Error('Crypto request has unsupported blockchain namespace')
  }

  if (!address) {
    throw new Error('Crypto request is missing the address')
  }

  const request: CryptoWalletRequest = {
    namespace: resolvedNamespace,
    action: 'pay',
    address,
    chainId: chainId ? chainId : namespace === 'ethereum' ? '1' : undefined,
    params: params ? Object.fromEntries(new URLSearchParams(params)) : {},
  }

  logger.debug('parsed blockchain request URL', { request })

  return request
}
