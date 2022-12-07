import React from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'

import LeftArrowIcon from 'assets/icons/left_arrow_icon.svg'
import {
  BLACK_COLOR,
  BLACK_COLOR_OPACITY,
  LIGHTGREY_COLOR,
  SEPARATOR,
  SNOW_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

interface AppModalProps {
  title: string
  visible: boolean
  rightIcon?: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
  children: React.ReactNode
  customStyles?: ViewStyle
}

const HIT_SLOP = {
  bottom: 20,
  left: 20,
  right: undefined,
  top: 50,
}

const AppModal = ({
  onClose,
  visible,
  children,
  title,
  footer,
  rightIcon,
  customStyles,
}: AppModalProps) => {
  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      hitSlop={HIT_SLOP}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerCurved} />
        <View style={styles.centeredView}>
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <LeftArrowIcon />
            </Pressable>
            <Text style={styles.headerTitle}>{title}</Text>
            {rightIcon ? <View>{rightIcon}</View> : <View />}
          </View>
          <View style={styles.divider} />
          <ScrollView style={[styles.modalView, customStyles]}>
            {children}
          </ScrollView>
          {footer && <View style={styles.bottom}>{footer}</View>}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK_COLOR_OPACITY(0.5),
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '600',
    textAlign: 'center',
    color: BLACK_COLOR,
  },
  centeredView: {
    flex: 1,
    height: 42,
    backgroundColor: WHITE_COLOR,
  },
  headerCurved: {
    height: 16,
    backgroundColor: WHITE_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 35,
  },
  divider: {
    height: 0.4,
    backgroundColor: SEPARATOR,
  },
  modalView: {
    flex: 1,
    backgroundColor: SNOW_COLOR,
  },
  bottom: {
    backgroundColor: WHITE_COLOR,
    borderTopColor: LIGHTGREY_COLOR,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: LIGHTGREY_COLOR,
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
})

export default AppModal
