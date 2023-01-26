import React, { ReactNode, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context'

import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import { ConditionalWrap } from './ConditionalWrap'
import LoadingView from './LoadingView'

interface ScreenProps {
  children?: ReactNode
  withSafeAreaView?: boolean
  withKeyboardAvoidingView: boolean
  statusBarColor?: string
  withLoadingView?: boolean
  showLoading?: boolean
  navBar?: ReactNode
  safeAreaViewProps?: SafeAreaViewProps
}

const Screen = (props: ScreenProps) => {
  const {
    withSafeAreaView,
    withLoadingView,
    showLoading,
    navBar,
    withKeyboardAvoidingView,
    safeAreaViewProps,
  } = props

  const styles = useThemeAwareStyle(createStyles)

  let NestedEle = withSafeAreaView ? (
    <SafeAreaView
      {...safeAreaViewProps}
      edges={safeAreaViewProps ? safeAreaViewProps.edges : ['top', 'bottom']}
      style={[styles.container]}>
      {navBar}
      {props.children}
    </SafeAreaView>
  ) : (
    <View style={[styles.container]}>
      {navBar}
      {props.children}
    </View>
  )

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
  NestedEle = withLoadingView ? (
    <View style={[styles.container]}>
      {NestedEle}
      {withLoadingView && (showLoading || !completeHideLoadingView) && (
        <Animated.View
          style={[styles.loadingView, { opacity: fadeInAnimRef.current }]}>
          <LoadingView />
        </Animated.View>
      )}
    </View>
  ) : (
    NestedEle
  )

  return (
    <ConditionalWrap
      condition={withKeyboardAvoidingView}
      wrap={(children) =>
        Platform.select({
          ios: (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.wrapper}>
              {children}
            </KeyboardAvoidingView>
          ),
          default: <View style={styles.wrapper}>{children}</View>,
        })
      }>
      <StatusBar barStyle='dark-content' translucent />
      {NestedEle}
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
      backgroundColor: theme.color.background,
    },
    loadingView: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.color.overlay,
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
}

export default Screen
