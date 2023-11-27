import Common from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'
import {
  getBlockchainNetwork,
  getTokenAddress,
  getTransactionParamsData,
  getWalletAddressForAsset,
  getWalletsData,
  isNativeToken,
  parseUnitsForSending,
} from 'features/cryptoWallet'
import sha256 from 'js-sha256'
import * as nearAPI from 'near-api-js'
import { store } from 'reduxStore'
import Web3 from 'web3'

import { walletProviderApi } from 'api/Wallet/WalletProvider'

const web3 = new Web3('http://localhost')

const minABI = [
  // transfer
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    type: 'function',
  },
]

// @chris done
const getTransactionParams = async (transactionData, wallets) => {
  const asset = transactionData.token.asset
  const requestBody = {
    asset: {
      chainId: asset.chainId,
      assetName: asset.assetName,
      tokenId: asset.tokenId,
    },
  }

  if (transactionData.token.asset.chainId.namespace === 'eip155') {
    const fromAddress = getWalletAddressForAsset(
      transactionData.token.asset,
      wallets
    )
    const toAddress = transactionData.address

    let input
    if (isNativeToken(transactionData.token.asset)) {
      input = {
        from: fromAddress,
        to: toAddress,
        value: parseUnitsForSending(
          transactionData.amount,
          transactionData.token.decimal
        ),
      }
    } else {
      let tokenAddress = getTokenAddress(transactionData.token.asset)
      let contract = new web3.eth.Contract(minABI, tokenAddress, {
        from: fromAddress,
      })

      input = {
        from: fromAddress,
        to: tokenAddress,
        value: '0x0',
        data: contract.methods
          .transfer(
            toAddress,
            parseUnitsForSending(
              transactionData.amount,
              transactionData.token.decimal
            )
          )
          .encodeABI(),
      }
    }

    requestBody.transactionParameters = input
  }

  const response = await walletProviderApi.post(
    'transaction/params',
    requestBody
  )

  return response.data.data
}

/**
 * @todo refactor
 *
 * This is a mess. It sends transactions to our server, but the transactions should be sent
 * via RPC_URL on the mobile for better and more flexibility so users in the future can
 * add other RPC_URLs tos end transactions.
 *
 * @param {*} transactionData
 * @param {*} isAssetEnablingTransaction
 * @param {*} state
 * @returns
 */
const sendTransaction = async (
  transactionData,
  isAssetEnablingTransaction,
  state
) => {
  const wallets = getWalletsData(state)
  const amount = parseUnitsForSending(
    transactionData.amount,
    transactionData.token.token.decimal
  )

  const tokenAddress = getTokenAddress(transactionData.token.asset)
  const isTokenNative = isNativeToken(transactionData.token.asset)
  const blockchainNetwork = getBlockchainNetwork(
    store.getState(),
    transactionData.token.asset.chainId
  )

  const tokenChainReference = blockchainNetwork.asset.chainId.reference
  const chainWallet = wallets[blockchainNetwork.chainId]
  const receiverAddress = transactionData.address

  let txString
  let txData
  let txIdAlgo

  const transactionParams = getTransactionParamsData(state)
  if (!transactionParams) {
    throw new Error('Transaction params missing')
  }

  if (blockchainNetwork.asset.chainId.namespace === 'near') {
    const nearAmount = nearAPI.utils.format.parseNearAmount(
      transactionData.amount
    )
    const prvtKey = chainWallet.privateKey.replace('ed25519:', '')
    const keyPair = nearAPI.utils.key_pair.KeyPairEd25519.fromString(prvtKey)
    const publicKey = keyPair.getPublicKey()

    const request = await walletProviderApi.post('transaction/nonce', {
      userAddress: chainWallet.address,
      asset: transactionData.token.asset,
      publicKey: publicKey.toString(),
    })

    let actions
    let txAddress
    if (isTokenNative) {
      actions = [nearAPI.transactions.transfer(nearAmount)]
      txAddress = receiverAddress
    } else {
      actions = [
        nearAPI.transactions.functionCall(
          'ft_transfer',
          {
            receiver_id: receiverAddress,
            amount: nearAmount,
          },
          5430000000000,
          1
        ),
      ]
      txAddress = tokenAddress
    }

    const recentBlockHash = nearAPI.utils.serialize.base_decode(
      transactionParams.block_hash
    )

    const nonce = request.data.data

    const transaction = nearAPI.transactions.createTransaction(
      chainWallet.address,
      publicKey,
      txAddress,
      nonce,
      actions,
      recentBlockHash
    )

    const serializedTx = nearAPI.utils.serialize.serialize(
      nearAPI.transactions.SCHEMA,
      transaction
    )

    const serializedTxHash = new Uint8Array(sha256.sha256.array(serializedTx))

    const signature = keyPair.sign(serializedTxHash)

    const signedTransaction = new nearAPI.transactions.SignedTransaction({
      transaction,
      signature: new nearAPI.transactions.Signature({
        keyType: transaction.publicKey.keyType,
        data: signature.signature,
      }),
    })

    const signedSerializedTx = signedTransaction.encode()

    txString = Buffer.from(signedSerializedTx).toString('base64')

    txData = {
      amount: amount,
      to: receiverAddress,
      from: chainWallet.address,
      token: transactionData.token,
      chain: blockchainNetwork,
    }
  } else if (blockchainNetwork.asset.chainId.namespace === 'eip155') {
    const request = await walletProviderApi.post('transaction/nonce', {
      userAddress: chainWallet.address,
      asset: transactionData.token.asset,
    })

    let transaction
    if (isTokenNative) {
      transaction = {
        to: receiverAddress,
        value: amount.toHexString().toString(),
        gasPrice: transactionParams.gasPrice,
        // Hardcoded based on few stackoverflow links and instructions of pranav, doesnt work without.
        gasLimit: '0x13881',
        nonce: request.data.data,
        chainID: tokenChainReference,
      }
    } else {
      let fromAddress = chainWallet.address
      let contract = new web3.eth.Contract(minABI, tokenAddress, {
        from: fromAddress,
      })

      transaction = {
        from: fromAddress,
        gasPrice: transactionParams.gasPrice,
        // Hardcoded based on few stackoverflow links and instructions of pranav, doesnt work without.
        gasLimit: '0x13881',
        to: tokenAddress,
        value: '0x0',
        data: contract.methods
          .transfer(receiverAddress, amount.toHexString().toString())
          .encodeABI(),
        nonce: request.data.data,
        chainID: tokenChainReference,
      }
    }

    const common = Common.custom({ chainId: tokenChainReference })

    const tx = Transaction.fromTxData(transaction, { common })

    const privateKey = Buffer.from(
      chainWallet.privateKey.substring(2, chainWallet.privateKey.length),
      'hex'
    )

    const signedTx = tx.sign(privateKey)

    const serializedTx = signedTx.serialize()

    txString = '0x' + serializedTx.toString('hex')

    txData = {
      amount: amount,
      to: receiverAddress,
      from: chainWallet.address,
      token: transactionData.token,
      chain: blockchainNetwork,
    }
  }

  if (txString) {
    const requestBody = {
      signedTransaction: txString,
      asset: transactionData.token.asset,
    }

    if (txIdAlgo) requestBody.transactionId = txIdAlgo

    const sentTx = await walletProviderApi.post(
      'transaction/broadcast',
      requestBody
    )

    if (!sentTx.data) {
      if (sentTx.originalError?.message)
        throw new Error(sentTx.originalError.message)
      throw new Error('Request failed')
    }

    if (sentTx.data.status === 'error') throw new Error(sentTx.data.error)

    if (sentTx.data.data?.transactionId)
      txData.id = sentTx.data.data.transactionId

    return txData
  }
}

export default {
  getTransactionParams,
  sendTransaction,
}
