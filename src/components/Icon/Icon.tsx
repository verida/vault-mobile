import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore as it comes from our own declaration extension
import { DimensionValue, SvgProps, View } from 'react-native'
import AntIcon from 'react-native-vector-icons/AntDesign'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { IconProps } from 'react-native-vector-icons/Icon'
import Ionicon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import EditIcon from 'assets/edit_icon.svg'
import CopyIcon from 'assets/icons/copy.svg'
import GoToIcon from 'assets/icons/goto_icon.svg'
import ShareIcon from 'assets/icons/share_icon.svg'
import TickIcon from 'assets/icons/tick_icon.svg'
import WarningIcon from 'assets/icons/warning_icon.svg'
import EthereumIcon from 'assets/wallets/Ethereum.svg'

// TODO: Check with the designers on whether to use custom icons or from a library and if so, pick a single library rather than the mix of different icons styles with currently have.

type CustomIconName =
  | 'edit'
  | 'copy'
  | 'goto'
  | 'share'
  | 'tick'
  | 'warning'
  | 'ethereum' // TODO: Remove the ethereum icon, wherever it's used, it should be coming from the blockchain network feature

type LibIconName =
  | 'back'
  | 'business'
  | 'calculator'
  | 'wallet'
  | 'clipboard' // TODO: replace the clipboard by copy?
  | 'inbox'
  | 'info-circle'
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
  | 'more-vertical'
  | 'more-horizontal'
  | 'eye'
  | 'eye-off'
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
  | 'send'
  | 'receive'
  | 'delete'

export type IconName = CustomIconName | LibIconName

export const Icon = (props: {
  name: IconName
  size?: DimensionValue | undefined
  color?: string
}) => {
  const { theme } = useTheme()
  const { name, size = '100%', color = theme.color.iconDefault } = props

  const iconProps: Partial<IconProps> = {
    style: {
      fontSize: 90,
      color,
    },
    adjustsFontSizeToFit: true,
  }

  const svgProps: SvgProps = {
    width: size,
    height: size,
    fill: color,
  }

  switch (name) {
    case 'ethereum':
      return <EthereumIcon {...svgProps} />
    case 'copy':
      return <CopyIcon {...svgProps} />
    case 'clipboard':
      return <Ionicon name='copy-outline' {...iconProps} />
    case 'edit':
      return <EditIcon {...svgProps} />
    case 'goto':
      return <GoToIcon {...svgProps} />
    case 'share':
      return <ShareIcon {...svgProps} />
    case 'warning':
      return <WarningIcon {...svgProps} />
    case 'tick':
      return <TickIcon {...svgProps} />
    case 'back':
      return (
        <IconWrapper size={size}>
          <AntIcon name='arrowleft' {...iconProps} />
        </IconWrapper>
      )
    case 'business':
      return (
        <IconWrapper size={size}>
          <Ionicon name='business' {...iconProps} />
        </IconWrapper>
      )
    case 'calculator':
      return (
        <IconWrapper size={size}>
          <Ionicon name='calculator' {...iconProps} />
        </IconWrapper>
      )
    case 'wallet':
      return (
        <IconWrapper size={size}>
          <Ionicon name='wallet' {...iconProps} />
        </IconWrapper>
      )
    case 'inbox':
      return (
        <IconWrapper size={size}>
          <MaterialCommunityIcon name='email' {...iconProps} />
        </IconWrapper>
      )
    case 'info-circle':
      return (
        <IconWrapper size={size}>
          <AntIcon name='infocirlce' {...iconProps} />
        </IconWrapper>
      )
    case 'question-circle':
      return (
        <IconWrapper size={size}>
          <AntIcon name='questioncircleo' {...iconProps} />
        </IconWrapper>
      )
    case 'exclamation-circle':
      return (
        <IconWrapper size={size}>
          <AntIcon name='exclamationcircle' {...iconProps} />
        </IconWrapper>
      )
    case 'check-circle':
      return (
        <IconWrapper size={size}>
          <AntIcon name='checkcircle' {...iconProps} />
        </IconWrapper>
      )
    case 'error-circle':
      return (
        <IconWrapper size={size}>
          <AntIcon name='closecircle' {...iconProps} />
        </IconWrapper>
      )
    case 'chevron-back':
      return (
        <IconWrapper size={size}>
          <Ionicon name='chevron-back' {...iconProps} />
        </IconWrapper>
      )
    case 'chevron-down':
      return (
        <IconWrapper size={size}>
          <Ionicon name='chevron-down' {...iconProps} />
        </IconWrapper>
      )
    case 'chevron-forward':
      return (
        <IconWrapper size={size}>
          <Ionicon name='chevron-forward' {...iconProps} />
        </IconWrapper>
      )
    case 'chevron-up':
      return (
        <IconWrapper size={size}>
          <Ionicon name='chevron-up' {...iconProps} />
        </IconWrapper>
      )
    case 'caret-back':
      return (
        <IconWrapper size={size}>
          <Ionicon name='caret-back' {...iconProps} />
        </IconWrapper>
      )
    case 'caret-down':
      return (
        <IconWrapper size={size}>
          <Ionicon name='caret-down' {...iconProps} />
        </IconWrapper>
      )
    case 'caret-forward':
      return (
        <IconWrapper size={size}>
          <Ionicon name='caret-forward' {...iconProps} />
        </IconWrapper>
      )
    case 'caret-up':
      return (
        <IconWrapper size={size}>
          <Ionicon name='caret-up' {...iconProps} />
        </IconWrapper>
      )
    case 'more-horizontal':
      return (
        <IconWrapper size={size}>
          <Ionicon name='ellipsis-horizontal' {...iconProps} />
        </IconWrapper>
      )
    case 'more-vertical':
      return (
        <IconWrapper size={size}>
          <Ionicon name='ellipsis-vertical' {...iconProps} />
        </IconWrapper>
      )
    case 'eye':
      return (
        <IconWrapper size={size}>
          <Ionicon name='eye' {...iconProps} />
        </IconWrapper>
      )
    case 'eye-off':
      return (
        <IconWrapper size={size}>
          <Ionicon name='eye-off' {...iconProps} />
        </IconWrapper>
      )
    case 'scan-qr':
      return (
        <IconWrapper size={size}>
          <MaterialCommunityIcon name='qrcode-scan' {...iconProps} />
        </IconWrapper>
      )
    case 'close':
      return (
        <IconWrapper size={size}>
          <Ionicon name='close' {...iconProps} />
        </IconWrapper>
      )
    case 'flash-on':
      return (
        <IconWrapper size={size}>
          <Ionicon name='flash' {...iconProps} />
        </IconWrapper>
      )
    case 'flash-off':
      return (
        <IconWrapper size={size}>
          <Ionicon name='flash-off' {...iconProps} />
        </IconWrapper>
      )
    case 'search':
      return (
        <IconWrapper size={size}>
          <Ionicon name='search' {...iconProps} />
        </IconWrapper>
      )
    case 'add':
      return (
        <IconWrapper size={size}>
          <MaterialIcon name='add' {...iconProps} />
        </IconWrapper>
      )
    case 'settings':
      return (
        <IconWrapper size={size}>
          <Ionicon name='settings-sharp' {...iconProps} />
        </IconWrapper>
      )
    case 'log-in':
      return (
        <IconWrapper size={size}>
          <Ionicon name='log-in-outline' {...iconProps} />
        </IconWrapper>
      )
    case 'log-out':
      return (
        <IconWrapper size={size}>
          <Ionicon name='log-out-outline' {...iconProps} />
        </IconWrapper>
      )
    case 'user':
    case 'profile':
      return (
        <IconWrapper size={size}>
          <Ionicon name='person' {...iconProps} />
        </IconWrapper>
      )
    case 'user-multiple':
      return (
        <IconWrapper size={size}>
          <Ionicon name='people' {...iconProps} />
        </IconWrapper>
      )
    case 'home':
      return (
        <IconWrapper size={size}>
          <MaterialIcon name='home' {...iconProps} />
        </IconWrapper>
      )
    case 'data':
      return (
        <IconWrapper size={size}>
          <Ionicon name='server' {...iconProps} />
        </IconWrapper>
      )
    case 'connections':
      return (
        <IconWrapper size={size}>
          <Ionicon name='share-social' {...iconProps} />
        </IconWrapper>
      )
    case 'blockchain':
      return (
        <IconWrapper size={size}>
          <FontAwesomeIcon name='chain' {...iconProps} />
        </IconWrapper>
      )
    case 'radio-button-checked':
      return (
        <IconWrapper size={size}>
          <MaterialCommunityIcon name='circle-slice-8' {...iconProps} />
        </IconWrapper>
      )
    case 'radio-button-unchecked':
      return (
        <IconWrapper size={size}>
          <MaterialCommunityIcon name='circle-outline' {...iconProps} />
        </IconWrapper>
      )
    case 'send':
      return (
        <IconWrapper size={size}>
          <MaterialIcon name='vertical-align-top' {...iconProps} />
        </IconWrapper>
      )
    case 'receive':
      return (
        <IconWrapper size={size}>
          <MaterialIcon name='vertical-align-bottom' {...iconProps} />
        </IconWrapper>
      )
    case 'delete':
      return (
        <IconWrapper size={size}>
          <MaterialIcon name='delete' {...iconProps} />
        </IconWrapper>
      )
  }
}

type IconWrapperProps = {
  size?: DimensionValue | undefined
  children: React.ReactNode
}
function IconWrapper(props: IconWrapperProps) {
  return (
    <View
      style={{
        width: props.size,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {props.children}
    </View>
  )
}
