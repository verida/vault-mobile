import { useWalletsData } from 'hooks'

export function getMaybeEthereumWalletForWalletConnectTopic({
  topic,
  walletsData,
}: {
  readonly topic: string
  readonly walletsData: ReturnType<typeof useWalletsData>
}) {
  return walletsData[topic]
}

export function getEthereumWalletForWalletConnectTopicOrThrow({
  topic,
  walletsData,
}: {
  readonly topic: string
  readonly walletsData: ReturnType<typeof useWalletsData>
}) {
  const maybeWallet = getMaybeEthereumWalletForWalletConnectTopic({
    topic,
    walletsData,
  })

  if (!maybeWallet)
    throw new Error(`Unable to find ethereum wallet for topic "${topic}".`)

  return maybeWallet
}
