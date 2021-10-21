import React, { useState } from 'react'
import {
  View,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Icon, List } from 'native-base'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Layout from 'components/Layouts/Layout'
import TokensList from 'components/Tokens/TokensList'

export default ({ visible, hideModal, list }) => {
  return (
    <Modal
      presentationStyle='pageSheet'
      animationType='slide'
      visible={visible}>
      <NavigationHeader
        left={{
          icon: <Icon name='close' style={{ color: '#000' }} />,
          action: () => hideModal(),
        }}
        title='Send'
      />
      <View style={styles.container}>
        <List>
          <TokensList list={list} />
        </List>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
})
