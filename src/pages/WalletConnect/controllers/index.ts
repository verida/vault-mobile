import AccountManager from '../../../api/AccountManager'
import { getStoreController, StoreController } from './store'
import { getWalletController, WalletController } from './wallet'

interface IAppControllers {
  store: StoreController
  wallet: WalletController
}

let controllers: IAppControllers | undefined

export function setupAppControllers(): IAppControllers {
  const wallet = getWalletController(
    AccountManager.getInstance().getSelectedAccount()
  )
  const store = getStoreController()
  controllers = { store, wallet }
  return controllers
}

export function getAppControllers(): IAppControllers {
  let _controllers = controllers
  if (!_controllers) {
    _controllers = setupAppControllers()
  }
  return _controllers
}
