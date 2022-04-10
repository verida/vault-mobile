import { getStoreController, StoreController } from './store'
import { getWalletController, WalletController } from './wallet'

interface IAppControllers {
  store: StoreController
  wallet: WalletController
}

let controllers: IAppControllers | undefined

export function setupAppControllers(veridaAccount: any): IAppControllers {
  const wallet = getWalletController(veridaAccount)
  const store = getStoreController()
  controllers = { store, wallet }
  return controllers
}

export function getAppControllers(veridaAccount: any): IAppControllers {
  let _controllers = controllers
  if (!_controllers) {
    _controllers = setupAppControllers(veridaAccount)
  }
  return _controllers
}
