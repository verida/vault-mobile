import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { BLACK_COLOR, BLACK_COLOR_OPACITY, SEPARATOR, WHITE_COLOR, SNOW_COLOR, LIGHTGREY_COLOR } from 'constants/color'

import { NUNITO_SANS_BOLD } from '../../constants/text'

interface AppModalProps {
  title: string
  visible: boolean
  onClose: () => void
  footer?: React.ReactNode
  children: React.ReactNode
}

const AppModal = ({
  onClose,
  visible,
  children,
  title,
  footer,
}: AppModalProps) => {
  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      hitSlop={{
        bottom: 20,
        left: 20,
        right: undefined,
        top: 50,
      }}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.centeredView}>
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              style={{
                marginLeft: 13,
              }}>
              <AntDesign name='close' size={20} color='black' />
            </Pressable>
            <Text style={styles.headerTitle}>{title}</Text>
            <View />
          </View>
          <View style={styles.divider} />
          <View style={styles.modalView}>{children}</View>
          {footer && <View style={styles.bottom}>{footer}</View>}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1,
    backgroundColor: BLACK_COLOR_OPACITY(0.5),
  },
  header: {
    height: 58,
    paddingTop: 16,
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
    backgroundColor: WHITE_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 45,
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
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
    borderTopColor: LIGHTGREY_COLOR,
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
