import WalletUtils from '@verida/wallet-utils'

const algosdk = require('algosdk')
const bip39 = require('bip39')
const ethers = require('ethers')

const generateMnemonic = () => {
  // generates random mnemonic
  const mnemonic = bip39.generateMnemonic()
  return mnemonic
}

const generateSingleWallet = (
  mnemonic: string,
  path: string,
  chain: string
) => {
  const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
  const childNode = node.derivePath(path)
  let wallet

  // if chain unrecognized, return error or something

  if (chain === 'near') {
    wallet = WalletUtils.utils.getWallet('near', childNode.mnemonic.phrase)
  } else if (chain === 'algorand') {
    const algoMnemonic = algosdk.mnemonicFromSeed(
      Buffer.from(childNode.privateKey.slice(2), 'hex')
    )
    wallet = WalletUtils.utils.getWallet('algo', algoMnemonic)
  } else if (chain === 'eip155') {
    wallet = WalletUtils.utils.getWallet('ethr', childNode.mnemonic.phrase)
  }

  return wallet
}

const generateWalletsForChains = (mnemonic: string, chains: any) => {
  const wallets: any = {}

  Object.values(chains).forEach((chain: any) => {
    const singleWallet = generateSingleWallet(
      mnemonic,
      chain.path,
      chain.data.namespace
    )
    if (singleWallet) wallets[chain.addressMap] = singleWallet
  })

  return wallets
}

export default {
  generateMnemonic,
  generateSingleWallet,
  generateWalletsForChains,
}
