import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import AntIcon from 'react-native-vector-icons/AntDesign'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import Ionicon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import EditIcon from 'assets/edit_icon.svg'
import CopyIcon from 'assets/icons/copy.svg'
import GoToIcon from 'assets/icons/goto_icon.svg'
import ShareIcon from 'assets/icons/share_icon.svg'
import TickIcon from 'assets/icons/tick_icon.svg'
import WalletIcon from 'assets/icons/wallet.svg'
import WarningIcon from 'assets/icons/warning_icon.svg'
import PlusIcon from 'assets/plus_icon.svg' // TODO: The icon should not have a color
import EthereumIcon from 'assets/wallets/Ethereum.svg'

// TODO: Check with the designers on whether to use custom icons or from a library and if so, pick a single library rather than the mix of different icons styles with currently have.

export type IconName =
  | 'wallet'
  | 'ethereum' // TODO: Remove the ethereum icon, wherever it's used, it should be coming from the blockchain network feature
  | 'copy'
  | 'clipboard' // TODO: replace the clipboard by copy?
  | 'edit'
  | 'plus'
  | 'goto'
  | 'share'
  | 'warning'
  | 'tick'
  | 'inbox'
  | 'question-circle'
  | 'exclamation-circle'
  | 'check-circle'
  | 'error-circle'
  | 'chevron-back'
  | 'chevron-forward'
  | 'chevron-up'
  | 'chevron-down'
  | 'caret-back'
  | 'caret-forward'
  | 'caret-up'
  | 'caret-down'
  | 'scan-qr'
  | 'close'
  | 'flash-on'
  | 'flash-off'
  | 'search'
  | 'add'
  | 'settings'
  | 'log-in'
  | 'log-out'
  | 'user'
  | 'user-multiple'
  | 'profile'
  | 'home'
  | 'data'
  | 'connections'
  | 'blockchain'
  | 'radio-button-unchecked'
  | 'radio-button-checked'

/**
 *  NOTE: to apply color correctly, need to modify the SVG by replacing color value with a generic name "currentColor"
 * Ex: asssets/icons/copy.svg
 *
 * <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 *  <path fill-rule="evenodd" clip-rule="evenodd"
 *   d="M15.5 1H4.5C3.4 1 2.5 1.9 2.5 3V16C2.5 16.55 2.95 17 3.5 17C4.05 17 4.5 16.55 4.5 16V4C4.5 3.45 4.95 3 5.5 3H15.5C16.05 3 16.5 2.55 16.5 2C16.5 1.45 16.05 1 15.5 1ZM19.5 5H8.5C7.4 5 6.5 5.9 6.5 7V21C6.5 22.1 7.4 23 8.5 23H19.5C20.6 23 21.5 22.1 21.5 21V7C21.5 5.9 20.6 5 19.5 5ZM9.5 21H18.5C19.05 21 19.5 20.55 19.5 20V8C19.5 7.45 19.05 7 18.5 7H9.5C8.95 7 8.5 7.45 8.5 8V20C8.5 20.55 8.95 21 9.5 21Z"
 *  fill="currentColor" />
 * </svg>
 */
export const Icon = (props: {
  name: IconName
  size?: number
  color?: string
}) => {
  const { theme } = useTheme()
  const { name, size = 24, color = theme.color.iconDefault } = props

  switch (name) {
    case 'wallet':
      return <WalletIcon width={size} height={size} fill={color} />
    case 'ethereum':
      return <EthereumIcon width={size} height={size} fill={color} />
    case 'copy':
      return <CopyIcon width={size} height={size} fill={color} />
    case 'clipboard':
      return <Ionicon name='copy-outline' size={size} color={color} />
    case 'edit':
      return <EditIcon width={size} height={size} fill={color} />
    case 'plus':
      return <PlusIcon width={size} height={size} fill={color} />
    case 'goto':
      return <GoToIcon width={size} height={size} fill={color} />
    case 'share':
      return <ShareIcon width={size} height={size} fill={color} />
    case 'warning':
      return <WarningIcon width={size} height={size} fill={color} />
    case 'tick':
      return <TickIcon width={size} height={size} fill={color} />
    case 'inbox':
      return <MaterialCommunityIcon name='email' size={size} color={color} />
    case 'question-circle':
      return <AntIcon name='questioncircleo' size={size} color={color} />
    case 'exclamation-circle':
      return <AntIcon name='exclamationcircle' size={size} color={color} />
    case 'check-circle':
      return <AntIcon name='checkcircleo' size={size} color={color} />
    case 'error-circle':
      return <AntIcon name='closecircle' size={size} color={color} />
    case 'chevron-back':
      return <Ionicon name='chevron-back' size={size} color={color} />
    case 'chevron-down':
      return <Ionicon name='chevron-down' size={size} color={color} />
    case 'chevron-forward':
      return <Ionicon name='chevron-forward' size={size} color={color} />
    case 'chevron-up':
      return <Ionicon name='chevron-up' size={size} color={color} />
    case 'caret-back':
      return <Ionicon name='caret-back' size={size} color={color} />
    case 'caret-down':
      return <Ionicon name='caret-down' size={size} color={color} />
    case 'caret-forward':
      return <Ionicon name='caret-forward' size={size} color={color} />
    case 'caret-up':
      return <Ionicon name='caret-up' size={size} color={color} />
    case 'scan-qr':
      return (
        <MaterialCommunityIcon name='qrcode-scan' size={size} color={color} />
      )
    case 'close':
      return <Ionicon name='close' size={size} color={color} />
    case 'flash-on':
      return <Ionicon name='flash' size={size} color={color} />
    case 'flash-off':
      return <Ionicon name='flash-off' size={size} color={color} />
    case 'search':
      return <Ionicon name='search' size={size} color={color} />
    case 'add':
      return <Ionicon name='add' size={size} color={color} />
    case 'settings':
      return <Ionicon name='settings-sharp' size={size} color={color} />
    case 'log-in':
      return <Ionicon name='log-in-outline' size={size} color={color} />
    case 'log-out':
      return <Ionicon name='log-out-outline' size={size} color={color} />
    case 'user':
    case 'profile':
      return <Ionicon name='person' size={size} color={color} />
    case 'user-multiple':
      return <Ionicon name='people' size={size} color={color} />
    case 'home':
      return <MaterialIcon name='home' size={size} color={color} />
    case 'data':
      return <Ionicon name='server' size={size} color={color} />
    case 'connections':
      return <Ionicon name='share-social' size={size} color={color} />
    case 'blockchain':
      return <FontAwesomeIcon name='chain' size={size} color={color} />
    case 'radio-button-checked':
      return (
        <MaterialCommunityIcon
          name='circle-slice-8'
          size={size}
          color={color}
        />
      )
    case 'radio-button-unchecked':
      return (
        <MaterialCommunityIcon
          name='circle-outline'
          size={size}
          color={color}
        />
      )
  }
}
