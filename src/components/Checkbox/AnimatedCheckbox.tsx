import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { Text } from 'components/Typography/Text'

interface Props {
  checked?: boolean
  onToggle?: () => void
  highlightColor: string
  checkmarkColor: string
  boxOutlineColor: string
  showLoading?: boolean
  loading?: boolean
  failed?: boolean
  label?: string
}

const AnimatedCheckbox = (props: Props) => {
  const { showLoading, label, checked, onToggle, failed } = props
  const { theme } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        onPress={onToggle}
        disabled={!onToggle}
        hitSlop={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.s,
          }}>
          {showLoading ? (
            <ActivityIndicator size='small' />
          ) : failed ? (
            <AntDesign name='closecircle' size={20} color={theme.color.error} />
          ) : checked ? (
            <AntDesign
              name='checkcircle'
              size={20}
              color={theme.color.success}
            />
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
          <Text style={{ fontSize: theme.fontSize.l }}>{label}</Text>
        </>
      )}
    </View>
  )
}

AnimatedCheckbox.defaultProps = {
  showLoading: false,
  checked: undefined,
  failed: undefined,
}

export default AnimatedCheckbox
