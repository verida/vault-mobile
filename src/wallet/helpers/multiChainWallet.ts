import WalletUtils from '@verida/wallet-utils'

const algosdk = require('algosdk')
const bip39 = require('bip39')
const ethers = require('ethers')

const generateMnemonic = () => {
  // generates random mnemonic
  const mnemonic = bip39.generateMnemonic()
  return mnemonic
}

type GenerateSingleWalletArgs = {
  mnemonic: string | null
  path: string
  chain: string
  privateKey: string | null
  address: string | null
  isHdWallet: boolean
}
const generateSingleWallet = (data: GenerateSingleWalletArgs) => {
  const { mnemonic, path, chain, privateKey, address, isHdWallet } = data

  // Handle case of "watched" wallet  with only the public address
  if (address && !privateKey && !mnemonic) {
    return {
      chain,
      mnemonic: null,
      privateKey: null,
      publicKey: null,
      address,
    }
  }

  let wallet

  // TODO: implement a switch
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

type GenerateWalletsForChainsArgs = {
  chains: any // TODO: Replace by proper chains type
  chain: string | null
  mnemonic: string | null
  privateKey: string | null
  address: string | null
}
const generateWalletsForChains = (data: GenerateWalletsForChainsArgs) => {
  const { chains, chain, mnemonic, privateKey, address } = data

  const wallets: any = {}

  Object.values(chains).forEach((singleChain: any) => {
    if (chain && singleChain.chainName !== chain) return
    const singleWallet = generateSingleWallet({
      mnemonic,
      path: singleChain.path,
      chain: singleChain.data.namespace,
      privateKey,
      address,
      isHdWallet: chain ? false : true,
    })
    if (singleWallet) wallets[singleChain.addressMapping] = singleWallet
  })

  return wallets
}

export default {
  generateMnemonic,
  generateSingleWallet,
  generateWalletsForChains,
}
