import { RootState } from '~/reduxStore/types'

export function getCustomBlockchains(state: RootState) {
  return state.blockchains.customBlockchains.data
}

export function getCustomBlockchainsStatus(state: RootState) {
  return state.blockchains.customBlockchains.status
}
