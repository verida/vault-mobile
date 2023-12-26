import { useTheme } from 'contexts/ThemeContext'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context'

import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import { ConditionalWrap } from './ConditionalWrap'
import LoadingIndicator from './LoadingIndicator'

interface ScreenProps {
  children?: ReactNode
  withSafeAreaView: boolean
  withKeyboardAvoidingView: boolean
  withLoadingView: boolean
  statusBarColor?: string
  showLoading?: boolean
  navBar?: ReactNode
  safeAreaViewProps?: SafeAreaViewProps
  containerStyle?: ViewStyle
  backgroundGrey: boolean
  loadingOverlayColorLight: boolean
  keyboadAvoidingViewProps?: KeyboardAvoidingViewProps
}

// TODO: Remove this component and use ScreenWrapper instead
// Made ScreenWrapper as a simpler version of rthis Screen component
// - Safe areas are enabled by default and use the hook rather than the Component for more stability
// - KeyboardAvoidingView is included but controlled via the `enabled` property
// - Didn't include loading to force the screen to handle it better inside the component rather than with a generic loading component
// - Didn't include the backgroundGrey and loadingOverlayColorLight so it's the responsibility of the screen itself
/**
 * @deprecated Use ScreenWrapper instead
 */
const Screen = (props: ScreenProps) => {
  const {
    withSafeAreaView,
    withLoadingView,
    showLoading,
    navBar,
    withKeyboardAvoidingView,
    safeAreaViewProps,
    containerStyle,
    backgroundGrey,
    loadingOverlayColorLight,
    keyboadAvoidingViewProps,
  } = props

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const fadeInAnimRef = useRef(new Animated.Value(1))
  const [completeHideLoadingView, setCompleteHideLoadingView] = useState(true)
  useEffect(() => {
    if (!completeHideLoadingView && !showLoading) {
      setCompleteHideLoadingView(false)
      Animated.timing(fadeInAnimRef.current, {
        toValue: 0,
        easing: Easing.quad,
        duration: 250,
        isInteraction: true,
        useNativeDriver: true,
      }).start(() => setCompleteHideLoadingView(true))
    }
  }, [completeHideLoadingView, showLoading])

  return (
    <ConditionalWrap
      condition={withKeyboardAvoidingView}
      wrap={(children) => (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.wrapper}
          {...keyboadAvoidingViewProps}>
          {children}
        </KeyboardAvoidingView>
      )}>
      <ConditionalWrap
        condition={Platform.OS === 'ios' && withSafeAreaView}
        wrap={(children) => (
          <SafeAreaView
            {...safeAreaViewProps}
            edges={
              safeAreaViewProps ? safeAreaViewProps.edges : ['top', 'bottom']
            }
            style={[
              styles.container,
              {
                backgroundColor: backgroundGrey
                  ? theme.color.backgroundGrey
                  : theme.color.background,
              },
            ]}>
            {children}
          </SafeAreaView>
        )}>
        <ConditionalWrap
          condition={withLoadingView}
          wrap={(children) => (
            <>
              {children}
              {(showLoading || !completeHideLoadingView) && (
                <Animated.View
                  style={[
                    styles.loadingView,
                    {
                      opacity: fadeInAnimRef.current,
                      backgroundColor: loadingOverlayColorLight
                        ? theme.color.overlayLight
                        : theme.color.overlay,
                    },
                  ]}>
                  <LoadingIndicator />
                </Animated.View>
              )}
            </>
          )}>
          <StatusBar barStyle='dark-content' translucent />
          <View
            style={[
              styles.container,
              {
                backgroundColor: backgroundGrey
                  ? theme.color.backgroundGrey
                  : theme.color.background,
              },
              containerStyle,
            ]}>
            {navBar}
            {props.children}
          </View>
        </ConditionalWrap>
      </ConditionalWrap>
    </ConditionalWrap>
  )
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    loadingView: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.color.overlayLight,
    },
    loadingIndicatorStyle: {
      width: 140,
    },
  })
}

Screen.defaultProps = {
  withSafeAreaView: false,
  withLoadingView: false,
  withKeyboardAvoidingView: false,
  backgroundGrey: false,
  loadingOverlayColorLight: true,
}

export default Screen
