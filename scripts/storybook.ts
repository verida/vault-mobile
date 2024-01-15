import * as child_process from 'child_process'

// eslint-disable-next-line no-void
void (async () => {
  try {
    child_process.execSync(`xcrun simctl openurl booted "storybook://"`, {
      stdio: 'inherit',
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})()
