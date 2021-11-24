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
        <SchemasList schemas={[item.item.data.requestSchema]} />
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
})
