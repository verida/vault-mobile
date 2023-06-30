import { WALLETCONNECT_SUPPORTED_CHAINS } from 'features/walletConnect'

export function getMaybeWalletConnectRpcUriForChainId(
  chainId: string | undefined
): string | undefined {
  if (typeof chainId !== 'string' || !chainId.length) return undefined

  const maybeMatchingConfiguration = Object.values(
    WALLETCONNECT_SUPPORTED_CHAINS
  ).find(
    ({ chainId: maybeMatchingChainId }) => maybeMatchingChainId === chainId
  )

  if (!maybeMatchingConfiguration) return undefined

  const { rpc } = maybeMatchingConfiguration

  if (typeof rpc !== 'string' || !rpc.length)
    throw new Error(
      `Expected non-empty string rpc, encountered "${String(rpc)}".`
    )

  return rpc
}
