import { convertHexToNumber, signingMethods } from '@walletconnect/utils'
import { Alert } from 'react-native'

import { getWalletController } from '../controllers'
import { EthereumWalletController } from '../controllers/ethereum'
import { apiGetCustomRequest } from '../helpers/api'
import {
  convertHexToUtf8IfPossible,
  ethNetworkFee,
  weiToGwei,
} from '../helpers/utilities'
import { DApp, IRequestRenderParams, IRpcEngine } from '../types'

export function filterEthereumRequests(payload: any) {
  return (
    payload.method &&
    (payload.method.startsWith('eth_') ||
      payload.method.startsWith('net_') ||
      payload.method.startsWith('shh_') ||
      payload.method.startsWith('personal_') ||
      payload.method.startsWith('wallet_'))
  )
}

export async function routeEthereumRequests(payload: any, state: any) {
  if (!state.connector) {
    return
  }
  const { chainId, connector, setRequests, requests: currentRequests } = state
  if (!signingMethods.includes(payload.method)) {
    try {
      const result = await apiGetCustomRequest(chainId, payload)
      connector.approveRequest({
        id: payload.id,
        result,
      })
    } catch (error) {
      return connector.rejectRequest({
        id: payload.id,
        error: { message: 'JSON RPC method not supported' },
      })
    }
  } else {
    const requests = [payload, ...currentRequests]
    setRequests(requests)
  }
}

export function renderEthereumRequests(payload: any): IRequestRenderParams[] {
  let params = [{ label: 'Method', value: payload.method }]

  switch (payload.method) {
    case 'eth_sendTransaction':
    case 'eth_signTransaction':
      const networkFee = ethNetworkFee(
        convertHexToNumber(payload.params[0].gas || payload.params[0].gasLimit),
        weiToGwei(
          convertHexToNumber(
            payload.params[0].gasPrice || payload.params[0].maxFeePerGas
          )
        )
      )
      params = [
        ...params,
        { label: 'From', value: payload.params[0].from },
        { label: 'To', value: payload.params[0].to },
        {
          label: 'Network Fee',
          value: networkFee,
        },
        {
          label: 'Value',
          value: payload.params[0].value
            ? convertHexToNumber(payload.params[0].value)
            : '',
        },
        { label: 'Data', value: payload.params[0].data },
      ]
      break

    case 'eth_sign':
      params = [
        ...params,
        { label: 'Address', value: payload.params[0] },
        { label: 'Message', value: payload.params[1] },
      ]
      break
    case 'personal_sign':
      params = [
        ...params,
        { label: 'Address', value: payload.params[1] },
        {
          label: 'Message',
          value: convertHexToUtf8IfPossible(payload.params[0]),
        },
      ]
      break
    case 'eth_signTypedData':
      const [address, strData] = payload.params
      const data = JSON.parse(strData)
      params = [
        ...params,
        {
          label: 'Address',
          value: address,
        },
        { label: 'Domain', value: data.domain },
        {
          label: 'Message',
          value: data.message,
        },
      ]
      break
    default:
      params = [
        ...params,
        {
          label: 'params',
          value: JSON.stringify(payload.params, null, '\t'),
        },
      ]
      break
  }
  return params
}

export async function signEthereumRequests(
  payload: any,
  state: any,
  dapp?: DApp
) {
  const { connector, address, activeIndex, chainId } = state
  let errorMsg = ''
  let result = null

  if (
    !getWalletController(dapp) ||
    getWalletController(dapp)?.getControllerType() !== 'eip155'
  ) {
    connector.rejectRequest({
      id: payload.id,
      error: { message: 'No Active Account' },
    })
    Alert.alert('Error', 'Invalid wallet type')
    return
  }

  const controller = getWalletController(dapp) as EthereumWalletController

  if (connector) {
    if (!controller.isActive()) {
      await controller.init(activeIndex, chainId)
    }

    let transaction = null
    let dataToSign = null
    let addressRequested = null

    switch (payload.method) {
      case 'eth_sendTransaction':
        transaction = payload.params[0]
        addressRequested = transaction.from
        if (address.toLowerCase() === addressRequested.toLowerCase()) {
          result = await controller.sendTransaction(transaction)
        } else {
          errorMsg = 'Address requested does not match active account'
        }
        break
      case 'eth_signTransaction':
        transaction = payload.params[0]
        addressRequested = transaction.from
        if (address.toLowerCase() === addressRequested.toLowerCase()) {
          result = await controller.signTransaction(transaction)
        } else {
          errorMsg = 'Address requested does not match active account'
        }
        break
      case 'eth_sign':
        dataToSign = payload.params[1]
        addressRequested = payload.params[0]
        if (address.toLowerCase() === addressRequested.toLowerCase()) {
          result = await controller.signMessage(dataToSign)
        } else {
          errorMsg = 'Address requested does not match active account'
        }
        break
      case 'personal_sign':
        dataToSign = payload.params[0]
        addressRequested = payload.params[1]
        if (address.toLowerCase() === addressRequested.toLowerCase()) {
          result = await controller.signPersonalMessage(dataToSign)
        } else {
          errorMsg = 'Address requested does not match active account'
        }
        break
      case 'eth_signTypedData':
        dataToSign = payload.params[1]
        addressRequested = payload.params[0]
        if (address.toLowerCase() === addressRequested.toLowerCase()) {
          result = await controller.signTypedData(dataToSign)
        } else {
          errorMsg = 'Address requested does not match active account'
        }
        break
      default:
        break
    }

    if (result) {
      connector.approveRequest({
        id: payload.id,
        result,
      })
    } else {
      let message = 'JSON RPC method not supported'
      if (errorMsg) {
        message = errorMsg
      }
      if (!getWalletController(dapp)?.isActive()) {
        message = 'No Active Account'
      }
      connector.rejectRequest({
        id: payload.id,
        error: { message },
      })
    }
  }
}

const ethereum: IRpcEngine = {
  filter: filterEthereumRequests,
  router: routeEthereumRequests,
  render: renderEthereumRequests,
  signer: signEthereumRequests,
}

export default ethereum
