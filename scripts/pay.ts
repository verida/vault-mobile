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

// eslint-disable-next-line no-void
void (async () => {
  try {
    if (type === 'goerli') {
      openDeepLinkInSimulator(
        'ethereum:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=1e16'
      )
    } else if (type === 'anvil') {
      openDeepLinkInSimulator(
        // anvil eth
        'ethereum:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@31337?value=1e16'
      )
    } else {
      throw new Error(`Unrecognized type, "${type}".`)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
