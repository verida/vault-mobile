import { ChainId } from 'caip'
import {
  getBalanceEip155,
  getBalanceNear,
  SupportedBlockchainNamespace,
} from 'features/blockchain'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/caip'

import { CryptoWalletBalances, MinifiedVeridaAccounts } from '../@types'

export async function fetchCryptoWalletBalances({
  chainMetadatas,
  minifiedAccounts,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly minifiedAccounts: MinifiedVeridaAccounts
}): Promise<CryptoWalletBalances> {
  const eip155Addresses = [
    ...new Set(
      minifiedAccounts
        .filter(
          ({ namespace }) => namespace === SupportedBlockchainNamespace.EIP_155
        )
        .map(({ address }) => address)
    ),
  ]

  const nearAddresses = [
    ...new Set(
      minifiedAccounts
        .filter(
          ({ namespace }) => namespace === SupportedBlockchainNamespace.NEAR
        )
        .map(({ address }) => address)
    ),
  ]

  const allNearSources = [...new Set([...nearAddresses])]

  const eip155Chains = chainMetadatas.filter(
    (e) => e.namespace === SupportedBlockchainNamespace.EIP_155
  )

  const nearChains = chainMetadatas.filter(
    (e) => e.namespace === SupportedBlockchainNamespace.NEAR
  )

  const eip155Rpcs = eip155Chains.map((e) =>
    getRpcUrlOrThrow({
      chainId: new ChainId(e),
      chainMetadatas,
    })
  )

  const [eip155Balances, nearBalances] = await Promise.all([
    Promise.all(
      eip155Rpcs.map((rpcUrl) =>
        Promise.all(
          eip155Addresses.map((address) =>
            getBalanceEip155({
              address,
              rpcUrl,
            })
              .then((e) => e.toString())
              .catch(() => null)
          )
        )
      )
    ),
    Promise.all(
      nearChains.map(({ namespace, reference }) =>
        Promise.all(
          allNearSources.map((address) =>
            getBalanceNear({
              chainId: new ChainId({ namespace, reference }),
              chainMetadatas,
              address,
            })
              .then((e) => e.available)
              .catch(() => null)
          )
        )
      )
    ),
  ])

  const eip155CryptoWalletBalances = Object.fromEntries(
    eip155Chains.map((eip155Chain, i) => {
      return [
        new ChainId(eip155Chain).toString(),
        Object.fromEntries(
          eip155Addresses.map((address, j) => [address, eip155Balances[i][j]])
        ),
      ]
    })
  )

  const nearCryptoWalletBalances = Object.fromEntries(
    nearChains.map((nearChain, i) => {
      return [
        new ChainId(nearChain).toString(),
        Object.fromEntries(
          allNearSources.map((address, j) => [address, nearBalances[i][j]])
        ),
      ]
    })
  )

  return { ...eip155CryptoWalletBalances, ...nearCryptoWalletBalances }
}
