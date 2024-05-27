import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'

import { ConditionalWrap } from 'components/ConditionalWrap'

import { BLACK_COLOR } from '../../constants/color'
import { NUNITO_SANS_BOLD } from '../../constants/text'
import Text from '../Text'

export interface LayoutProps extends ViewProps {
  withKeyboardAvoidingView: boolean
  withScrollView: boolean
  title?: string
}

/**
 * @deprecated use <ScreenWrapper> instead
 */
const Layout = (props: LayoutProps) => {
  const { withKeyboardAvoidingView, withScrollView } = props

  return (
    <ConditionalWrap
      condition={withKeyboardAvoidingView}
      wrap={(children) => (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.wrapper}>
          <View style={styles.wrapperContainer}>{children}</View>
        </KeyboardAvoidingView>
      )}>
      <ConditionalWrap
        condition={withScrollView}
        wrap={(children) => (
          <ScrollView
            contentContainerStyle={[styles.container, props.style]}
            keyboardShouldPersistTaps='handled'>
            {children}
          </ScrollView>
        )}>
        {props.title && <Text style={styles.title}>{props.title}</Text>}
        {props.children}
      </ConditionalWrap>
    </ConditionalWrap>
  )
}

export default Layout

Layout.defaultProps = {
  withKeyboardAvoidingView: false,
  withScrollView: true,
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  wrapperContainer: { flex: 1, paddingBottom: 20 },
  container: {
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 16,
    fontSize: 22,
    lineHeight: 41,
    fontFamily: NUNITO_SANS_BOLD,
    color: BLACK_COLOR,
  },
})
