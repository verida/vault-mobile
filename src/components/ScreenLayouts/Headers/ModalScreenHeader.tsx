import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaFrame } from 'react-native-safe-area-context'

import { Icon } from '~/components/Icon'
import { HIT_SLOP_10_10 } from '~/constants/buttons'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import { BaseScreenHeader } from './BaseScreenHeader'

export type ModalScreenHeaderProps = NativeStackHeaderProps

export const ModalScreenHeader: React.FunctionComponent<
  ModalScreenHeaderProps
> = (props) => {
  const { navigation, options, ...otherProps } = props
  const { headerLeft } = options

  const layout = useSafeAreaFrame()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const handleBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const defaultHeaderLeft: typeof options.headerLeft = useCallback(
    () => (
      <TouchableOpacity
        onPress={handleBackPress}
        hitSlop={HIT_SLOP_10_10}
        style={styles.closeButton}>
        <Icon name='close' size={24} color={theme.color.onBackground} />
      </TouchableOpacity>
    ),
    [handleBackPress, theme.color.onBackground, styles.closeButton]
  )

  return (
    <BaseScreenHeader
      {...otherProps}
      navigation={navigation}
      options={{
        ...options,
        headerLeft: headerLeft || defaultHeaderLeft,
      }}
      layout={layout}
    />
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    closeButton: {
      marginLeft: theme.spacing.m,
    },
  })
