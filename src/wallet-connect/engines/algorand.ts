import algosdk from 'algosdk'
import { Alert } from 'react-native'

import { getWalletController } from '../controllers'
import { AlgorandWalletController } from '../controllers/algorand'
import {
  DApp,
  IRequestRenderParams,
  IRpcEngine,
  MultisigMetadata,
  SignTxnParams,
} from '../types'

export interface SigningTransaction {
  txn: algosdk.Transaction
  shouldSign: boolean
  signers?: string[]
  message?: string
  msig?: MultisigMetadata
}

export function filterAlgorandRequests(payload: any) {
  return payload.method && payload.method.startsWith('algo_')
}

export async function routeAlgorandRequests(payload: any, state: any) {
  if (!state.connector) {
    return
  }
  const { setRequests, requests: currentRequests } = state
  const requests = [payload, ...currentRequests]
  setRequests(requests)
}

export function renderAlgorandRequests(payload: any): IRequestRenderParams[] {
  let params = [{ label: 'Method', value: payload.method }]
  const signingRequest: SignTxnParams = payload.params

  const signingTxns: SigningTransaction[] = signingRequest[0].map(
    (walletTxn) => {
      const rawTxn = Buffer.from(walletTxn.txn, 'base64')
      const txn = algosdk.decodeUnsignedTransaction(
        rawTxn
      ) as algosdk.Transaction

      const dontSign =
        Array.isArray(walletTxn.signers) && walletTxn.signers.length === 0

      return {
        txn,
        shouldSign: !dontSign,
        signers: walletTxn.signers,
        message: walletTxn.message,
        msig: walletTxn.msig,
      }
    }
  )

  // TODO: fine-grained render transaction info based on the method
  switch (payload.method) {
    default:
      const txn = signingTxns[0].txn
      const txtInfo = txn._getDictForDisplay()
      params = [
        ...params,
        ...(txtInfo.from
          ? [
              {
                label: 'From',
                value: txtInfo.from,
              },
            ]
          : []),
        ...(txtInfo.to
          ? [
              {
                label: 'To',
                value: txtInfo.to,
              },
            ]
          : []),
        ...(txtInfo.fee
          ? [
              {
                label: 'Fee',
                value: txtInfo.fee / Math.pow(10, 6) + ' ALGO',
              },
            ]
          : []),
        ...(txtInfo.amount
          ? [
              {
                label: 'Amount',
                value: Number(txtInfo.amount) / Math.pow(10, 6) + ' ALGO',
              },
            ]
          : []),
        { label: 'Message', value: signingTxns[0].message },
      ]
      break
  }
  return params
}

export async function signAlgorandRequests(
  payload: any,
  state: any,
  dapp?: DApp
) {
  const { connector } = state

  if (
    !getWalletController(dapp) ||
    getWalletController(dapp).getControllerType() !== 'algo'
  ) {
    connector.rejectRequest({
      id: payload.id,
      error: { message: 'No Active Account' },
    })
    Alert.alert('Error', 'Invalid wallet type')
    return
  }

  const controller = getWalletController(dapp) as AlgorandWalletController

  if (connector) {
    const signingRequest: SignTxnParams = payload.params

    const signingTxns: SigningTransaction[] = signingRequest[0].map(
      (walletTxn) => {
        const rawTxn = Buffer.from(walletTxn.txn, 'base64')
        const txn = algosdk.decodeUnsignedTransaction(
          rawTxn
        ) as algosdk.Transaction

        const dontSign =
          Array.isArray(walletTxn.signers) && walletTxn.signers.length === 0

        return {
          txn,
          shouldSign: !dontSign,
          signers: walletTxn.signers,
          message: walletTxn.message,
          msig: walletTxn.msig,
        }
      }
    )

    const signingOptions =
      signingRequest.length > 1 ? signingRequest[1] : undefined
    const signingMessage = signingOptions ? signingOptions.message : undefined

    let signingResponse: Array<Uint8Array | null>
    try {
      signingResponse = await controller.signTransaction(
        signingTxns,
        signingMessage
      )
    } catch (err) {
      connector.rejectRequest({
        id: payload.id,
        error: { message: 'Request rejected by wallet.' },
      })
      return
    }

    const result = signingResponse.map((sigOrNull) => {
      if (!sigOrNull) {
        return null
      }
      return Buffer.from(sigOrNull).toString('base64')
    })

    connector.approveRequest({
      id: payload.id,
      result,
    })
  }
}

const algorand: IRpcEngine = {
  filter: filterAlgorandRequests,
  router: routeAlgorandRequests,
  render: renderAlgorandRequests,
  signer: signAlgorandRequests,
}

export default algorand
