import React, { ReactChild } from 'react'
import {
  Modal,
  ModalProps,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  BLACK_COLOR_OPACITY,
  LIGHTGREY_COLOR,
  SEPARATOR,
  WHITE_COLOR,
} from 'constants/color'
import Text from './Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import Ionicons from 'react-native-vector-icons/Ionicons'

export interface BottomActionsModalProps extends ModalProps {
  title: string
  message?: string
  footer: ReactChild
  onClose: () => void
  titleIcon?: React.Component
}

const BottomActionsModal: React.FC<BottomActionsModalProps> = (props) => {
  const {
    title,
    message,
    footer,
    onClose,
    children,
    titleIcon,
    ...rest
  } = props
  return (
    <Modal {...rest} transparent={true} animationType={'slide'}>
      <View style={styles.container}>
        <View style={styles.space} />
        <SafeAreaView style={styles.contentContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              {titleIcon}
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                hitSlop={{
                  top: 10,
                  right: 10,
                  bottom: 10,
                  left: 10,
                }}
                onPress={onClose}>
                <Ionicons
                  name='close'
                  size={24}
                  color={BLACK_COLOR_OPACITY(0.6)}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            {message && <Text style={styles.message}>{message}</Text>}
            {children}
            {footer}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1,
    backgroundColor: BLACK_COLOR_OPACITY(0.2),
  },
  space: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: WHITE_COLOR,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  content: {},
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
    marginRight: 32,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LIGHTGREY_COLOR,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SEPARATOR,
  },
  message: {
    marginBottom: 24,
  },
})

export default BottomActionsModal
