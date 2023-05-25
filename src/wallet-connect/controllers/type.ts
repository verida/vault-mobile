import { SigningTransaction } from '../engines/algorand'

export interface IWalletController {
  getControllerType(): string
  isActive(): boolean | null
}

// TODO: refine ether types
export interface IEtherWalletController extends IWalletController {
  init(activeIndex: any, chainId: any): any
  sendTransaction(transaction: any): any
  signTransaction(transaction: any): any
  signMessage(dataToSign: any): any
  signPersonalMessage(dataToSign: any): any
  signTypedData(dataToSign: any): any
  populateTransaction(params: any): any
}

export interface IAlgoWalletController extends IWalletController {
  signTransaction(
    signingTxns: SigningTransaction[],
    signingMessage: string | undefined
  ): (Uint8Array | null)[] | PromiseLike<(Uint8Array | null)[]>
}

export interface INearWalletController extends IWalletController {
  signTransaction(
    signingTxns: SigningTransaction[],
    signingMessage: string | undefined
  ): (Uint8Array | null)[] | PromiseLike<(Uint8Array | null)[]>
}
