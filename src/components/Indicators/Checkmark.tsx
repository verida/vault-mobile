import { useTheme } from 'contexts'
import React from 'react'
import Ionicon from 'react-native-vector-icons/Ionicons'

export type CheckmarkProps = {
  size?: number
  color?: string
}

export const Checkmark: React.FunctionComponent<CheckmarkProps> = (props) => {
  const { size = 24, color } = props

  const { theme } = useTheme()

  return (
    <Ionicon
      name='checkmark-circle'
      size={size}
      color={color || theme.color.success}
    />
  )
}
