import React from 'react'
import {
  Modal,
  ModalProps,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import {
  BLACK_COLOR_OPACITY,
  LIGHTGREY_COLOR,
  SEPARATOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

import Text from './Text'

export interface BottomActionsModalProps extends ModalProps {
  title: string
  subtitle?: string
  message?: string
  footer?: React.ReactElement
  onClose: () => void
  titleIcon?: React.ReactElement
}

const BottomActionsModal: React.FC<BottomActionsModalProps> = (props) => {
  const {
    title,
    message,
    footer,
    onClose,
    subtitle,
    children,
    titleIcon,
    ...rest
  } = props
  return (
    <Modal {...rest} transparent={true} animationType={'slide'}>
      <View style={styles.container}>
        <View style={styles.space} />
        <SafeAreaView style={styles.contentContainer}>
          <View style={message ? styles.content : null}>
            <View style={message ? styles.messageHeader : styles.header}>
              {titleIcon}
              <View style={styles.titleWrapper}>
                <Text style={message ? styles.messageTitle : styles.title}>
                  {title}
                </Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
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
            <View
              style={[styles.divider, message ? styles.messageDivider : null]}
            />
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
  content: { paddingVertical: 16, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageHeader: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  titleWrapper: {
    marginRight: 32,
    flex: 1,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
  },
  messageTitle: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 22,
  },
  subtitle: {
    color: 'rgba(4, 17, 51, 0.5)',
    fontSize: 17,
    marginRight: 32,
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
  messageDivider: {
    marginHorizontal: -20,
    marginVertical: 16,
  },
  message: {
    marginBottom: 24,
  },
})

export default BottomActionsModal
