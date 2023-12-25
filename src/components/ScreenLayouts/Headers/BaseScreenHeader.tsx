import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { getHeaderTitle, Header } from '@react-navigation/elements'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { Icon } from 'components'
import { useTheme } from 'contexts'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native'

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
              ? 'light-content' // iOS stacked modals add a black background
              : theme.statusBar.defaultStyle
          }
          backgroundColor={theme.color.background}
        />
        <Header
          title={getHeaderTitle(options, route.name)}
          headerTitleAlign={headerTitleAlign || 'center'}
          headerLeftLabelVisible={false}
          modal={isModal}
          headerBackground={headerBackground}
          headerBackgroundContainerStyle={[
            styles.backgroundContainer,
            headerShadowVisible && styles.separator,
          ]}
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
                    hitSlop={HIT_SLOP_10_10}>
                    <Icon
                      name='back'
                      size={24}
                      color={theme.color.onBackground}
                    />
                  </TouchableOpacity>
                )
              : headerLeft
          }
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
                  <Text // TODO: Use Typography component?
                    style={styles.title}
                    numberOfLines={1}
                    ellipsizeMode='tail'>
                    {children}
                  </Text>
                )
          }
          headerShadowVisible={false}
          headerStyle={headerStyle}
          headerTitleStyle={headerTitleStyle}
          headerTintColor={headerTintColor}
          headerTransparent={headerTransparent}
          headerLeftContainerStyle={styles.leftContainer}
          headerRightContainerStyle={styles.rightContainer}
        />
      </>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backgroundContainer: {
      backgroundColor: 'yellow',
    },
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    leftContainer: {},
    rightContainer: {},
    title: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.sl,
      textAlign: 'center',
    },
  })
