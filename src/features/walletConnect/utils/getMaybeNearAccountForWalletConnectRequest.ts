import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { maybeParseCaip } from 'features/caip'
import { getMaybeVeridaWalletAccountForWalletConnectRequest } from 'features/walletConnect'
import { useWalletsData } from 'hooks'

// https://docs.near.org/tools/near-api-js/quick-reference#key-store
export async function getMaybeNearAccountForWalletConnectRequest({
  web3wallet,
  request,
  walletsData,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
  //readonly topic: string
  //readonly keystore: NearKeystore
  //readonly nearNetworkParsedCaipType: ParsedCaipType
}) {
  const { params } = request
  const { chainId: caipIdentifier } = params

  const maybeParsedCaip = maybeParseCaip(caipIdentifier)

  if (!maybeParsedCaip) return undefined

  const maybeVeridaWalletAccount =
    getMaybeVeridaWalletAccountForWalletConnectRequest({
      web3wallet,
      request,
      walletsData,
    })

  //if (!maybeVeridaWalletAccount) return undefined

  //const { privateKey } = maybeVeridaWalletAccount
  //const { chainId } = maybeParsedCaip

  //const keyPair = KeyPair.fromString(privateKey)

  //const keyStore = new keyStores.InMemoryKeyStore()

  //// TODO: fix
  //await keyStore.setKey(chainId, 'example-account.testnet', keyPair)

  throw new Error('near get account not yet implemented')

  //const nearAccounts = await getNearAccounts({
  //  keystore,
  //  nearNetworkParsedCaipType,
  //})
  //return nearAccounts.filter((e) => e.publicKey === topic)
}
