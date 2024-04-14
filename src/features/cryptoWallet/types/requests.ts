import { AccountId } from 'caip'

import { ResourceParams } from './assets'

export type CryptoWalletRequestAction = 'pay'
export type CryptoWalletRequestFunction = 'transfer'

export type CryptoWalletRequestParams = {
  value?: string
  uint256?: string
  address?: string
  message?: string
}

export type CryptoWalletRawRequest = {
  chainNamespace: string
  chainReference: string
  action: CryptoWalletRequestAction
  address: string
  function?: CryptoWalletRequestFunction
  params: CryptoWalletRequestParams
}

export type CryptoWalletRequest<A extends CryptoWalletRequestAction = 'pay'> = {
  action: A
  resource: ResourceParams
  recipientAccount: AccountId
  amount: undefined | number // TODO: Should probably be a string for big numbers
}
