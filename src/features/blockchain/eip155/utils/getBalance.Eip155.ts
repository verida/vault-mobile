import { ethers } from 'ethers'

export async function getBalanceEip155({
  address,
  rpcUrl,
}: {
  readonly address: string
  readonly rpcUrl: string
}) {
  return new ethers.providers.JsonRpcProvider(rpcUrl).getBalance(address)
}
