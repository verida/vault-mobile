import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { maybeParseCaip } from 'features/caip'
import { NearWalletAccountInfo } from 'features/near'
import { useWalletsData } from 'hooks'
import { keyStores, utils } from 'near-api-js'

import { getMaybeVeridaWalletAccountForWalletConnectRequest } from './getMaybeVeridaWalletAccountForWalletConnectRequest'

// https://docs.near.org/tools/near-api-js/quick-reference#key-store
export async function getMaybeNearAccountForWalletConnectRequest({
  web3wallet,
  request,
  walletsData,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}): Promise<NearWalletAccountInfo | undefined> {
  const { params, topic } = request
  const { chainId: caipIdentifier } = params

  const maybeParsedCaip = maybeParseCaip(caipIdentifier)

  if (!maybeParsedCaip) return undefined

  const maybeVeridaWalletAccount =
    getMaybeVeridaWalletAccountForWalletConnectRequest({
      web3wallet,
      request,
      walletsData,
    })

  if (!maybeVeridaWalletAccount) return undefined

  const { privateKey } = maybeVeridaWalletAccount
  const { chainId } = maybeParsedCaip

  const keyPair = utils.KeyPair.fromString(privateKey)

  const publicKey = keyPair.getPublicKey().toString()

  const keystore = new keyStores.InMemoryKeyStore()

  const accountId = topic

  await keystore.setKey(chainId, accountId, keyPair)

  return { keystore, accountId, publicKey }
}
