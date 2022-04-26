import * as nearAPI from 'near-api-js'
import store from 'reduxStore'
import { getWalletsData } from 'reduxStore/wallet/selectors'

const { connect } = nearAPI
const { keyStores, KeyPair } = nearAPI
const keyStore = new keyStores.InMemoryKeyStore()

// adds the keyPair you created to keyStore

const config = {
  networkId: 'testnet',
  keyStore, // optional if not signing transactions
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
}

export default async function main() {
  const reduxState = store.getState()
  const accounts = getWalletsData(reduxState)
  const wallet = accounts.near
  const prvtKey = wallet.privateKey.replace('ed25519:', '')

  // creates a public / private key pair using the provided private key
  const keyPair = KeyPair.fromString(prvtKey)
  await keyStore.setKey('testnet', wallet.address, keyPair)

  const near = await connect(config)

  return near
}
