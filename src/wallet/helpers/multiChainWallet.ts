import WalletUtils from '@verida/wallet-utils'

const algosdk = require('algosdk')
const bip39 = require('bip39')
const ethers = require('ethers')

const generateMnemonic = () => {
  // generates random mnemonic
  const mnemonic = bip39.generateMnemonic()
  return mnemonic
}

const generateSingleWallet = (data: any) => {
  const { mnemonic, path, chain, privateKey, isHdWallet } = data
  let wallet

  if (chain === 'near') {
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
    const childNode = node.derivePath(path)
    wallet = WalletUtils.utils.getWallet('near', childNode.mnemonic.phrase)
  } else if (chain === 'algorand') {
    let algoMnemonic
    if (isHdWallet) {
      const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
      const childNode = node.derivePath(path)
      algoMnemonic = algosdk.mnemonicFromSeed(
        Buffer.from(childNode.privateKey.slice(2), 'hex')
      )
    } else {
      algoMnemonic = mnemonic
    }
    wallet = WalletUtils.utils.getWallet('algo', algoMnemonic)
  } else if (chain === 'eip155') {
    if (privateKey) {
      wallet = WalletUtils.utils.getWalletByPrivateKey('ethr', privateKey)
    } else {
      const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
      const childNode = node.derivePath(path)
      wallet = WalletUtils.utils.getWallet('ethr', childNode.mnemonic.phrase)
    }
  }

  return wallet
}

const generateWalletsForChains = (data: any) => {
  const { chains, chain, mnemonic, privateKey } = data

  const wallets: any = {}

  Object.values(chains).forEach((singleChain: any) => {
    if (chain && singleChain.chainName !== chain) return
    const singleWallet = generateSingleWallet({
      mnemonic,
      path: singleChain.path,
      chain: singleChain.data.namespace,
      privateKey,
      isHdWallet: chain ? false : true,
    })
    if (singleWallet) wallets[singleChain.addressMap] = singleWallet
  })

  return wallets
}

export default {
  generateMnemonic,
  generateSingleWallet,
  generateWalletsForChains,
}
