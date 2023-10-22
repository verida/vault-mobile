import { SelectSingleTokenData } from 'features/cryptoWallet/@types'
import { Icon, List } from 'native-base'
import React from 'react'
import { Modal, StyleSheet, TextInput, View } from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokensList from 'components/Tokens/TokensList'

const SendListModal = React.memo(function SendListModal({
  visible,
  hideModal,
  list,
  onPressItem,
}: {
  readonly visible: boolean
  readonly hideModal: () => void
  readonly list: readonly SelectSingleTokenData[] | undefined
  readonly onPressItem: (item: SelectSingleTokenData) => void
}): JSX.Element {
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
      <View style={styles.searchContainer}>
        <Icon name='search-outline' style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder='Search' />
      </View>
      <View style={styles.container}>
        <List>
          <TokensList list={list} onPressItem={onPressItem} />
        </List>
      </View>
    </Modal>
  )
})

export default SendListModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
  searchIcon: { color: 'rgba(60, 60, 67, 0.6)', fontSize: 24 },
  searchContainer: {
    backgroundColor: 'rgba(239, 241, 244, 1)',
    flexDirection: 'row',
    marginVertical: 10,
    marginTop: 0,
    marginHorizontal: 15,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
  },
  searchInput: {
    fontSize: 18,
    marginLeft: 4,
    color: 'rgba(60, 60, 67, 0.6)',
  },
})
