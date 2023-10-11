import { Logger } from 'features/telemetry'

const SUPPORTED_BLOCKCHAIN_NAMESPACE = ['eip155', 'near']
const SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES = [
  'ethereum',
  ...SUPPORTED_BLOCKCHAIN_NAMESPACE,
]

const logger = new Logger('Crypto Wallet')

export function isBlockchainRequestDeepLink(url: string) {
  return isBlockchainRequestUrl(url)
}

export function isBlockchainRequestQrCode(qrCodeMessage: string) {
  return isBlockchainRequestUrl(qrCodeMessage)
}

export function isBlockchainRequestUrl(url: string) {
  logger.debug('Checking if URL is a blockchain request', { url })
  return SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES.some((namespace) =>
    url.startsWith(`${namespace}:`)
  )
}

export function parseBlockchainRequestDeepLink(url: string) {
  return parseBlockchainRequest(url)
}

export function parseBlockchainRequestQrCode(qrCodeMessage: string) {
  return parseBlockchainRequest(qrCodeMessage)
}

export function parseBlockchainRequest(url: string): Record<string, unknown> {
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
    throw new Error('Invalid blockchain request URL')
  }

  const { namespace, prefix, address, chainId, params } = match.groups!

  const request = {
    namespace: namespace
      ? namespace === 'ethereum'
        ? 'eip155'
        : namespace
      : undefined,
    action: prefix ? prefix.slice(0, -1) : undefined,
    address,
    chainId: chainId ? chainId : namespace === 'ethereum' ? '1' : undefined,
    params: params
      ? Object.fromEntries(new URLSearchParams(params))
      : undefined,
  }

  logger.debug('parsed blockchain request URL', { request })

  return request
}
