import React, { useState } from 'react'
import { Content } from 'native-base'
import * as Sentry from '@sentry/react-native'
import { Alert, View } from 'react-native'
import AccountManager from 'api/AccountManager'
import Text from '../../Text'

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
      const handleResult = await vault.inbox.handleAction(inboxItem, result, {})
      setCurrentAction(null)
      if (!handleResult.success) {
        Alert.alert('Error', 'Invalid schema, part of data maybe missing')
      } else {
        navigation.goBack()
      }
    } catch (e) {
      console.error(e)
      Alert.alert('Error', 'Cannot accept data now')
      Sentry.captureException(e)
      setCurrentAction(null)
    }
  }

  return (
    <Content>
      <View style={styles.container}>
        <Text>{item.item.subject}</Text>
        <Text>{item.item.message}</Text>
        <Text>{item.item.link}</Text>
      </View>
    </Content>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    marginHorizontal: 15,
  },
})
