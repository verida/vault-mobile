import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { getHeaderTitle, Header } from '@react-navigation/elements'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import React, { useCallback } from 'react'
import { Platform, StatusBar, StyleSheet, TouchableOpacity } from 'react-native'

import { Icon, Typography } from '~/components'
import { HIT_SLOP_10_10 } from '~/constants/buttons'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { useNavigationHeaderHeight } from '~/navigation'
import { Theme } from '~/styles/types'

export type BaseScreenHeaderProps =
  | NativeStackHeaderProps
  | BottomTabHeaderProps

export const BaseScreenHeader: React.FunctionComponent<
  BaseScreenHeaderProps
> = (props) => {
  const { navigation, options, route } = props
  const {
    headerTintColor,
    headerLeft,
    headerRight,
    headerTitle,
    headerTitleAlign,
    headerTitleStyle,
    headerStyle,
    headerShadowVisible,
    headerTransparent,
    headerBackground,
  } = options

  const isModal = 'presentation' in options && options.presentation !== 'card'
  const { statusBarHeightForHeaderComponent } = useNavigationHeaderHeight({
    isModal,
  })

  const canGoBack = navigation.canGoBack()
  const handleBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <>
      <StatusBar
        barStyle={
          isModal && Platform.OS === 'ios'
            ? 'light-content' // iOS stacked modal adds a black background
            : theme.statusBar.defaultStyle
        }
        backgroundColor='transparent'
        translucent
      />
      <Header
        title={getHeaderTitle(options, route.name)}
        modal={isModal}
        headerStatusBarHeight={statusBarHeightForHeaderComponent}
        headerTransparent={headerTransparent}
        headerShadowVisible={false}
        headerStyle={[styles.header, headerStyle]}
        headerBackground={headerBackground}
        headerBackgroundContainerStyle={[
          styles.backgroundContainer,
          headerShadowVisible && styles.separator,
        ]}
        headerTintColor={headerTintColor}
        headerLeftLabelVisible={false}
        headerLeftContainerStyle={styles.leftContainer}
        headerLeft={
          typeof headerLeft === 'function'
            ? ({ tintColor, labelVisible, pressColor, pressOpacity }) =>
                headerLeft({
                  canGoBack,
                  labelVisible,
                  pressColor,
                  pressOpacity,
                  tintColor,
                  label:
                    'headerBackTitle' in options
                      ? options.headerBackTitle
                      : undefined,
                })
            : headerLeft === undefined && canGoBack
              ? () => (
                  <TouchableOpacity
                    onPress={handleBackPress}
                    hitSlop={HIT_SLOP_10_10}
                    style={styles.defaultBackButton}>
                    <Icon
                      name='back'
                      size={24}
                      color={theme.color.onBackground}
                    />
                  </TouchableOpacity>
                )
              : headerLeft
        }
        headerRightContainerStyle={styles.rightContainer}
        headerRight={
          typeof headerRight === 'function'
            ? ({ pressColor, pressOpacity, tintColor }) =>
                headerRight({
                  canGoBack,
                  pressColor,
                  pressOpacity,
                  tintColor,
                })
            : headerRight
        }
        headerTitleAlign={headerTitleAlign || 'center'}
        headerTitleStyle={headerTitleStyle}
        headerTitleContainerStyle={styles.titleContainer}
        headerTitle={
          typeof headerTitle === 'function'
            ? ({ children, tintColor, allowFontScaling, onLayout, style }) =>
                headerTitle({
                  children,
                  tintColor,
                  allowFontScaling,
                  onLayout,
                  style,
                })
            : ({ children }) => (
                <Typography
                  variant='h4'
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {children}
                </Typography>
              )
        }
      />
    </>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backgroundContainer: {},
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    header: {},
    leftContainer: {},
    titleContainer: {},
    rightContainer: {},
    defaultBackButton: {
      marginLeft: theme.spacing.m,
    },
    title: {
      textAlign: 'center',
    },
  })
