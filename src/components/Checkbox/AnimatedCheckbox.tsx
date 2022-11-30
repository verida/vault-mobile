import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { Spacer } from 'components/Spacer'
import { Text } from 'components/Typography/Text'

interface Props {
  checked?: boolean
  highlightColor: string
  checkmarkColor: string
  boxOutlineColor: string
  showLoading?: boolean
  loading?: boolean
  failed?: boolean
  label?: string
}

const AnimatedCheckbox = (props: Props) => {
  const { showLoading, label, checked, failed } = props
  const { theme } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          minWidth: 32,
          minHeight: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {showLoading ? (
          <ActivityIndicator size='small' />
        ) : failed ? (
          <AntDesign name='closecircle' size={20} color={theme.color.error} />
        ) : checked ? (
          <AntDesign name='checkcircle' size={20} color={theme.color.success} />
        ) : (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: theme.color.gray300,
            }}
          />
        )}
      </View>
      {label && (
        <>
          <Spacer width={10} />
          <Text>{label}</Text>
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
