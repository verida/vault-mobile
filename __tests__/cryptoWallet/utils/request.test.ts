/* eslint-disable import/first */
import 'jest'

import { BLOCKCHAIN_NAMESPACES } from '~/features/blockchain/constants'
import { isSupportedCaipNamespace } from '~/features/caip/utils/isSupportedCaipNamespace'

// Required as request.ts imports a simple function from features/caip but the whole internal module is loaded even though it's unnecessary for these unit tests
jest.mock('~/features/caip', () => ({
  isSupportedCaipNamespace,
}))

// Required as request.ts imports a simple constants from features/blockchain but the whole internal module is loaded even though it's unnecessary for these unit tests
jest.mock('~/features/blockchain', () => ({
  BLOCKCHAIN_NAMESPACES,
}))

import { CryptoWalletRawRequest } from '~/features/cryptoWallet'
import {
  isCryptoRequestDeepLink,
  isCryptoRequestQrCode,
  parseCryptoRequestDeepLink,
  parseCryptoRequestQrCode,
} from '~/features/cryptoWallet/utils/request'

const VALID_CRYPTO_REQUESTS: {
  request: string
  result: CryptoWalletRawRequest
}[] = [
  {
    request:
      'ethereum:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F?value=1e18',
    result: {
      chainNamespace: 'eip155',
      chainReference: '1',
      action: 'pay',
      address: '0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F',
      params: { value: '1e18' },
    },
  },
  {
    request:
      'ethereum:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=1e18',
    result: {
      chainNamespace: 'eip155',
      chainReference: '5',
      action: 'pay',
      address: '0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F',
      params: { value: '1e18' },
    },
  },
  {
    request:
      'ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=0.01e18&message=Hey%20Vitalik%2C%20remember%20you%20owe%20me%200.01%20ETH!',
    result: {
      chainNamespace: 'eip155',
      chainReference: '5',
      action: 'pay',
      address: '0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F',
      params: {
        value: '0.01e18',
        message: 'Hey Vitalik, remember you owe me 0.01 ETH!',
      },
    },
  },
  {
    request:
      'eip155:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@80001?value=1e18',
    result: {
      chainNamespace: 'eip155',
      chainReference: '80001',
      action: 'pay',
      address: '0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F',
      params: { value: '1e18' },
    },
  },
  {
    request:
      'eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@80001?value=1e18',
    result: {
      chainNamespace: 'eip155',
      chainReference: '80001',
      action: 'pay',
      address: '0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F',
      params: { value: '1e18' },
    },
  },
  {
    request: 'eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@80001',
    result: {
      chainNamespace: 'eip155',
      chainReference: '80001',
      action: 'pay',
      address: '0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F',
      params: {},
    },
  },
  {
    request:
      'ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e6',
    result: {
      chainNamespace: 'eip155',
      chainReference: '5',
      action: 'pay',
      function: 'transfer',
      address: '0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F',
      params: {
        address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
        uint256: '5e6',
      },
    },
  },
]

/** strings that a crypto requests (ie. starts with supported namespace) but invalid */
const INVALID_CRYPTO_REQUESTS = [
  'eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F?value=1e18', // no chain id for eip155
  'eip155:?value=1e18', // missing address
]

/** strings that are not crypto requests */
const NOT_CRYPTO_REQUESTS = [
  '',
  'https://example.com',
  'cosmos-hub:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@567/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e18', // cosmos-hub is not supported namespace
]

describe('isCryptoRequestDeepLink', () => {
  it('returns true for valid crypto request deep links', () => {
    VALID_CRYPTO_REQUESTS.forEach((request) => {
      expect(isCryptoRequestDeepLink(request.request)).toBe(true)
    })
  })

  it('returns false for invalid crypto request deep links', () => {
    NOT_CRYPTO_REQUESTS.forEach((request) => {
      expect(isCryptoRequestDeepLink(request)).toBe(false)
    })
  })
})

describe('isCryptoRequestQrCode', () => {
  it('returns true for valid crypto request QR codes', () => {
    VALID_CRYPTO_REQUESTS.forEach((request) => {
      expect(isCryptoRequestQrCode(request.request)).toBe(true)
    })
  })

  it('returns false for invalid crypto request QR codes', () => {
    NOT_CRYPTO_REQUESTS.forEach((request) => {
      expect(isCryptoRequestQrCode(request)).toBe(false)
    })
  })
})

describe('parseCryptoRequestDeepLink', () => {
  it('parses valid crypto request deep links', () => {
    VALID_CRYPTO_REQUESTS.forEach((request) => {
      expect(parseCryptoRequestDeepLink(request.request)).toEqual(
        request.result
      )
    })
  })

  it('throws an error for invalid crypto request deep links', () => {
    ;[...NOT_CRYPTO_REQUESTS, ...INVALID_CRYPTO_REQUESTS].forEach((request) => {
      expect(() => parseCryptoRequestDeepLink(request)).toThrow()
    })
  })
})

describe('parseCryptoRequestQrCode', () => {
  it('parses valid crypto request QR codes', () => {
    VALID_CRYPTO_REQUESTS.forEach((request) => {
      expect(parseCryptoRequestQrCode(request.request)).toEqual(request.result)
    })
  })

  it('throws an error for invalid crypto request QR codes', () => {
    ;[...NOT_CRYPTO_REQUESTS, ...INVALID_CRYPTO_REQUESTS].forEach((request) => {
      expect(() => parseCryptoRequestQrCode(request)).toThrow()
    })
  })
})
