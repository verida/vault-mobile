import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { getHeaderTitle, Header } from '@react-navigation/elements'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { Icon, Typography } from 'components'
import { useTheme } from 'contexts'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import { Platform, StatusBar, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HIT_SLOP_10_10 } from 'constants/buttons'
import { Theme } from 'styles/types'

export type BaseScreenHeaderProps =
  | NativeStackHeaderProps
  | BottomTabHeaderProps

export const BaseScreenHeader: React.FunctionComponent<BaseScreenHeaderProps> =
  (props) => {
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

    // The following have been copied from react-navigation's Header component:
    const insets = useSafeAreaInsets()
    const hasDynamicIsland = Platform.OS === 'ios' && insets.top > 50
    const statusBarHeight = hasDynamicIsland ? insets.top - 5 : insets.top
    // https://github.com/react-navigation/react-navigation/blob/968840cb4f98303562de9e29fae7fbfda9c8d2fa/packages/elements/src/Header/Header.tsx#L86C55-L86C70
    // Reason is that, for some reason, `isParentHeaderShown` (see link above) is true in stack screens while it shouldn't and thus set the status bar height to 0, so have to set it ourselves. It's likely the `isParentHeaderShown=true` is due to a mistake of ours somewhere.

    const isModal = 'presentation' in options && options.presentation !== 'card'
    const canGoBack = navigation.canGoBack()

    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()

    const handleBackPress = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    return (
      <>
        <StatusBar
          barStyle={
            isModal && Platform.OS === 'ios'
              ? 'light-content' // iOS stacked modal adds a black background
              : theme.statusBar.defaultStyle
          }
          backgroundColor='transparent'
        />
        <Header
          title={getHeaderTitle(options, route.name)}
          modal={isModal}
          headerStatusBarHeight={
            isModal && Platform.OS === 'ios' ? 0 : statusBarHeight
          }
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
