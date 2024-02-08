import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import { Edge, useSafeAreaInsets } from 'react-native-safe-area-context'

import { Theme } from 'styles/types'

export type ScreenWrapperProps = {
  children: React.ReactNode
  backgroundColor?: string
  /** Takes priority over allSafeAreaEdges */
  noSafeArea?: boolean
  /** Takes priority over safeAreaEdges */
  allSafeAreaEdges?: boolean
  /** Default to ['bottom', 'left', 'right'], ie. assume there's a header */
  safeAreaEdges?: Edge[]
  keyboardAvoiding?: boolean
  keyboardAvoidingBehavior?: KeyboardAvoidingViewProps['behavior']
  keyboardVerticalOffset?: KeyboardAvoidingViewProps['keyboardVerticalOffset']
}

/**
 * Screen wrapper component for all screens (stack or modal) that handles the safe area insets and keyboard avoiding view.
 * This wrapper assumes there's a header above it, so doesn't add the top inset.
 */
export const ScreenWrapper: React.FunctionComponent<ScreenWrapperProps> = (
  props
) => {
  const {
    children,
    backgroundColor,
    noSafeArea = false,
    allSafeAreaEdges = false,
    safeAreaEdges = ['bottom', 'left', 'right'],
    keyboardAvoiding = false,
    keyboardAvoidingBehavior,
    keyboardVerticalOffset,
  } = props

  const insets = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)

  const resolvedSafeAreaEdges = noSafeArea
    ? []
    : allSafeAreaEdges
    ? ['top', 'bottom', 'left', 'right']
    : safeAreaEdges

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: resolvedSafeAreaEdges.includes('top')
            ? insets.top
            : undefined,
          paddingBottom: resolvedSafeAreaEdges.includes('bottom')
            ? insets.bottom
            : undefined,
          paddingLeft: resolvedSafeAreaEdges.includes('left')
            ? insets.left
            : undefined,
          paddingRight: resolvedSafeAreaEdges.includes('right')
            ? insets.right
            : undefined,
        },
        backgroundColor
          ? {
              backgroundColor: backgroundColor,
            }
          : {},
      ]}>
      <KeyboardAvoidingView
        enabled={keyboardAvoiding}
        behavior={
          keyboardAvoidingBehavior || Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={{ flex: 1 }}>
        {children}
      </KeyboardAvoidingView>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
  })
