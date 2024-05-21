import { Account } from '@verida/account'
import { explodeDID } from '@verida/helpers'
import { Network } from '@verida/types'

export function getNetworkFromDID(did: string): Network {
  let { network: networkAsString } = explodeDID(did)

  if (networkAsString === 'mainnet') {
    networkAsString = Network.MYRTLE
  }

  const network =
    networkAsString === Network.MYRTLE
      ? Network.MYRTLE
      : networkAsString === Network.BANKSIA
        ? Network.BANKSIA
        : networkAsString === Network.DEVNET
          ? Network.DEVNET
          : networkAsString === Network.LOCAL
            ? Network.LOCAL
            : null
  console.log('networkAsString', networkAsString, network)

  if (!network) throw new Error(`Invalid Verida Network: ${networkAsString}`)

  return network
}

export async function getNetworkFromAccount(account: Account) {
  const did = await account.did()
  return getNetworkFromDID(did)
}
