import { Account } from '@verida/account'
import { explodeDID } from '@verida/helpers'
import { EnvironmentType } from '@verida/types'

export function getNetworkFromDID(did: string): EnvironmentType {
  const { network: networkAsString } = explodeDID(did)
  const network =
    networkAsString === EnvironmentType.MAINNET
      ? EnvironmentType.MAINNET
      : networkAsString === EnvironmentType.TESTNET
        ? EnvironmentType.TESTNET
        : networkAsString === EnvironmentType.DEVNET
          ? EnvironmentType.DEVNET
          : networkAsString === EnvironmentType.LOCAL
            ? EnvironmentType.LOCAL
            : null

  if (!network) throw new Error(`Invalid Verida Network: ${networkAsString}`)

  return network
}

export async function getNetworkFromAccount(account: Account) {
  const did = await account.did()
  return getNetworkFromDID(did)
}
