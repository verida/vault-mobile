import React, { useState } from 'react'
import { Content } from 'native-base'
import * as Sentry from '@sentry/react-native'
import { Alert, StyleSheet, View } from 'react-native'
import AccountManager from 'api/AccountManager'
import LogoSvg from 'assets/icons/house.svg'
import Text from 'components/Text'
import moment from 'moment'
import SchemasList from 'components/Inbox/SchemasList'
import { GREY_COLOR } from 'constants/color'
import Button from 'components/Button'
import { isEmpty } from 'lodash'

export default ({ item, inboxItem, navigation }) => {
  const [currentAction, setCurrentAction] = useState(null)
  const [selectedItems, setSelectedItem] = useState([])

  const handleAction = async (result) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = AccountManager.getInstance().vault
      await vault.inbox.handleAction(inboxItem, result, selectedItems)
      setCurrentAction(null)
      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', 'Cannot sync data now')
      Sentry.captureException(e)
      setCurrentAction(null)
    }
  }

  async function onConfirmShareableItems(items) {
    setSelectedItem(items)
  }

  const formattedSentAt = moment(item.item.sentAt).format('MMM DD, HH:mm')

  const { userSelect, requestSchema } = item.item.data

  const shareEnabled = (userSelect && !isEmpty(selectedItems)) || !userSelect

  function onItemPress(url) {
    navigation.navigate('ShareableData', {
      schemaUrl: url,
      onConfirm: onConfirmShareableItems,
    })
  }

  return (
    <Content>
      <View style={styles.container}>
        <View style={styles.sender}>
          <LogoSvg />
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{item.item.sentBy.context}</Text>
            <Text style={styles.sendAt}>{formattedSentAt}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <SchemasList schemas={[requestSchema]} onItemPress={onItemPress} />
      </View>
      <View style={styles.footer}>
        <Button
          color='grey'
          style={styles.button}
          onPress={() => handleAction('decline')}
          loading={currentAction === 'decline'}>
          Ignore
        </Button>
        <Button
          style={[styles.button, styles.shareButton]}
          onPress={() => handleAction('accept')}
          loading={false}
          disabled={!shareEnabled}>
          Share
        </Button>
      </View>
    </Content>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sender: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  senderName: {
    color: '#333333',
    fontSize: 14,
  },
  sendAt: {
    color: '#333333',
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: GREY_COLOR,
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
  },
  shareButton: {
    marginLeft: 10,
  },
})
