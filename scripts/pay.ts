import * as child_process from 'child_process'

const openDeepLinkInSimulator = (uri: string) => {
  child_process.execSync(`xcrun simctl openurl booted "${uri}"`, {
    stdio: 'inherit',
  })
}

const [type] = process.argv.slice(2)

if (typeof type !== 'string' || !type.length)
  throw new Error(
    `Expected non-empty string type, encountered "${String(type)}".`
  )

const REQUEST_TEMPLATES = {
  'goerli-eth-msg':
    'ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=0.01e18&message=Hey%20Vitalik%2C%20remember%20you%20owe%20me%200.01%20ETH!',
  'goerli-eth-zero':
    'ethereum:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=0',
  'goerli-usdc':
    'ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e6',
  'polygon-eth':
    'eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@80001?value=0.01e18',
  'polygon-eth2':
    'eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@80001?value=6.81e18',
  'near-testnet':
    'near:pay-3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18',
  'near-testnet2':
    'near:3076f3dee55eac87d1d4cb721716ca4fc64ed73e25c5665fc8457dbd0a71cb71@testnet?value=1e18',
  'invalid-0':
    'cosmos-hub:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@567/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e18',
  'invalid-1':
    'eip155:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@567/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5e18',
  'invalid-2':
    'ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  'invalid-3':
    'ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa37f&uint256=5a18',
  'invalid-4':
    'ethereum:0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5/transfer?address=0x07865c6e87b9f70255377e024ace6630c1eaa38f&uint256=5e18',
}

// eslint-disable-next-line no-void
void (async () => {
  try {
    // @ts-expect-error untyped
    const { [type]: maybePaymentRequest } = REQUEST_TEMPLATES

    if (typeof maybePaymentRequest === 'string' && maybePaymentRequest.length) {
      openDeepLinkInSimulator(maybePaymentRequest)
    } else {
      throw new Error(`Unrecognized type, "${type}".`)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
