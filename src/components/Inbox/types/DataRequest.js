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

export default ({ item, inboxItem, type, navigation }) => {
  const [currentAction, setCurrentAction] = useState(null)
  const onResultClick = async (result) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = AccountManager.getInstance().vault
      await vault.inbox.handleAction(inboxItem, result, {})
      setCurrentAction(null)
      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', 'Cannot sync data now')
      Sentry.captureException(e)
      setCurrentAction(null)
    }
  }

  console.log('item:', item)
  const formattedSentAt = moment(item.item.sentAt).format('MMM DD, HH:mm')

  function onItemPress(url) {
    navigation.navigate('ShareableData', { schemaUrl: url })
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
        <SchemasList
          schemas={[item.item.data.requestSchema]}
          onItemPress={onItemPress}
        />
      </View>
      <View style={styles.footer}>
        <Button
          color='grey'
          style={styles.button}
          onPress={() => {}}
          loading={false}>
          Ignore
        </Button>
        <Button
          style={[styles.button, styles.shareButton]}
          onPress={() => {}}
          loading={false}>
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
