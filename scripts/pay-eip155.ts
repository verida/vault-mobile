import * as child_process from 'child_process'

const openDeepLinkInSimulator = (uri: string) => {
  child_process.execSync(`xcrun simctl openurl booted "${uri}"`, {
    stdio: 'inherit',
  })
}

// eslint-disable-next-line no-void
void (async () => {
  try {
    openDeepLinkInSimulator(
      // native eth
      'ethereum:pay-0x49EB80ff0472F930588745f4dAe7ca7c5C1A9B2F@5?value=5e16'
    )

    // goerli usdc
    // 0x07865c6e87b9f70255377e024ace6630c1eaa37f
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
