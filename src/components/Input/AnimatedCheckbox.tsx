import React, { ReactNode } from 'react'
import {
  ActivityIndicator,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { Text } from '~/components/Typography/Text'
import { useTheme } from '~/contexts/ThemeContext'

export type AnimatedCheckboxProps = {
  checked?: boolean
  onToggle?: () => void
  loading?: boolean
  failed?: boolean
  label?: string
  textStyle?: TextStyle
  containerStyle?: ViewStyle
  failedIcon?: ReactNode
  successIcon?: ReactNode
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = (props) => {
  const {
    label,
    onToggle,
    checked = false,
    loading = false,
    failed = false,
    textStyle,
    containerStyle,
    failedIcon,
    successIcon,
  } = props
  const { theme } = useTheme()

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
        },
        containerStyle,
      ]}>
      <TouchableOpacity
        onPress={onToggle}
        disabled={!onToggle}
        hitSlop={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {loading ? (
            <ActivityIndicator size='small' />
          ) : failed ? (
            failedIcon || (
              <AntDesign
                name='closecircle'
                size={20}
                color={theme.color.error}
              />
            )
          ) : checked ? (
            successIcon || (
              <AntDesign
                name='checkcircle'
                size={20}
                color={theme.color.success}
              />
            )
          ) : (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.color.lightGrey,
                backgroundColor: theme.color.veryLightGrey,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
      {label && (
        <>
          <Text
            style={[
              {
                fontSize: theme.fontSize.l,
                marginLeft: theme.spacing.s,
              },
              textStyle,
            ]}>
            {label}
          </Text>
        </>
      )}
    </View>
  )
}
