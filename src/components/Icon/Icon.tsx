import { useTheme } from 'contexts/ThemeContext'
import React from 'react'

import EditIcon from 'assets/edit_icon.svg'
import CopyIcon from 'assets/icons/copy.svg'
import GoToIcon from 'assets/icons/goto_icon.svg'
import ShareIcon from 'assets/icons/share_icon.svg'
import WalletIcon from 'assets/icons/wallet.svg'
import PlusIcon from 'assets/plus_icon.svg'
import EthereumIcon from 'assets/wallets/Ethereum.svg'

export type IconName =
  | 'Wallet'
  | 'ethereum'
  | 'copy'
  | 'edit'
  | 'plus'
  | 'goto'
  | 'share'

/**
 *  NOTE: to apply color correctly, need to modify the SVG by replacing color value with a generic name "currentColor"
 * Ex: asssets/icons/copy.svg
 *
 * <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 *  <path fill-rule="evenodd" clip-rule="evenodd"
 *   d="M15.5 1H4.5C3.4 1 2.5 1.9 2.5 3V16C2.5 16.55 2.95 17 3.5 17C4.05 17 4.5 16.55 4.5 16V4C4.5 3.45 4.95 3 5.5 3H15.5C16.05 3 16.5 2.55 16.5 2C16.5 1.45 16.05 1 15.5 1ZM19.5 5H8.5C7.4 5 6.5 5.9 6.5 7V21C6.5 22.1 7.4 23 8.5 23H19.5C20.6 23 21.5 22.1 21.5 21V7C21.5 5.9 20.6 5 19.5 5ZM9.5 21H18.5C19.05 21 19.5 20.55 19.5 20V8C19.5 7.45 19.05 7 18.5 7H9.5C8.95 7 8.5 7.45 8.5 8V20C8.5 20.55 8.95 21 9.5 21Z"
 *  fill="currentColor" />
 * </svg>
 *
 */
export const Icon = (props: {
  name: IconName
  size?: number
  color?: string
}) => {
  const { theme } = useTheme()
  const { name, size = 24, color = theme.color.icon } = props
  let ic = null
  switch (name) {
    case 'Wallet':
      ic = <WalletIcon width={size} height={size} fill={color} />
      break
    case 'ethereum':
      ic = <EthereumIcon width={size} height={size} fill={color} />
      break
    case 'copy':
      ic = <CopyIcon width={size} height={size} fill={color} />
      break
    case 'edit':
      ic = <EditIcon width={size} height={size} fill={color} />
      break
    case 'plus':
      ic = <PlusIcon width={size} height={size} fill={color} />
      break
    case 'goto':
      ic = <GoToIcon width={size} height={size} fill={color} />
      break
    case 'share':
      ic = <ShareIcon width={size} height={size} fill={color} />
      break
  }

  return ic
}
