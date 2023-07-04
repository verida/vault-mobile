import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { useWalletsData } from 'hooks'

export function getMaybeEthereumWalletForWalletConnectRequest({
  request,
  walletsData,
}: {
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}) {
  // eslint-disable-next-line no-console
  console.warn(
    JSON.stringify({
      walletsData,
      request,
    })
  )

  // TODO: fix this
  return walletsData[request.topic]
}

export function getEthereumWalletForWalletConnectRequestOrThrow({
  request,
  walletsData,
}: {
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}) {
  const maybeWallet = getMaybeEthereumWalletForWalletConnectRequest({
    request,
    walletsData,
  })

  if (!maybeWallet)
    throw new Error(
      `Unable to find ethereum wallet for topic "${request.topic}".`
    )

  return maybeWallet
}
