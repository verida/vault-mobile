import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { isEmpty } from 'lodash'
import moment from 'moment'
import React, { useState } from 'react'
import { Alert, Image, StyleSheet, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { DefaultAvatar } from '~/api/utils'
import { InboxEntry } from '~/api/VaultCommon/interfaces/inbox/Inbox'
import { DataAction } from '~/api/VaultCommon/managers/inbox/DataAction'
import { RequestedDataSelector } from '~/components/Inbox/RequestedDataSelector'
import { BottomActionBar } from '~/components/ScreenLayouts'
import Text from '~/components/Text'
import { ACCEPT_COLOR, DECLINE_COLOR, GREY_COLOR } from '~/constants/color'
import { Logger } from '~/features/telemetry'
import { MainStackParams } from '~/navigation'

const logger = Logger.create('Components/Inbox/types/DatabaseSync')

export interface DataRequestProps {
  item: {
    logo: any
    title: string
    item: InboxEntry & {
      sentAt: Date | string
    }
  }
  navigation: NativeStackNavigationProp<MainStackParams>
}

const DataRequest: React.FC<DataRequestProps> = (props) => {
  const { item, navigation } = props
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [selectedItems, setSelectedItem] = useState<any[]>([])

  const handleAction = async (result: keyof DataAction) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = AccountManager.getInstance().vault
      await vault?.inbox.handleAction(item.item, result, selectedItems)
      setCurrentAction(null)
      navigation.goBack()
    } catch (error) {
      Alert.alert('Error', 'Something went wrong when sending the data')
      logger.error(error)
      setCurrentAction(null)
    }
  }

  async function onConfirmSelectedItems(items: any[]) {
    setSelectedItem(items)
  }

  const formattedSentAt = moment(item.item.sentAt).format('MMM DD, HH:mm')

  const { userSelect, requestSchema, filter, fallbackAction, status } =
    item.item.data

  const shareEnabled = (userSelect && !isEmpty(selectedItems)) || !userSelect

  function onItemPress(url: string) {
    navigation.navigate('ShareableData', {
      schemaUrl: url,
      onConfirm: onConfirmSelectedItems,
      filter,
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.sender}>
          <Image
            source={item.logo || DefaultAvatar}
            style={styles.senderAvatar}
          />
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{item.item.sentBy.context}</Text>
            <Text style={styles.sendAt}>{formattedSentAt}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        {status ? (
          <View style={[styles.statusContainer, { justifyContent: 'center' }]}>
            <Text
              style={[
                styles.status,
                status === 'accept'
                  ? styles.statusAccept
                  : styles.statusDecline,
              ]}>
              {status === 'accept' ? 'Accepted' : 'Declined'}
            </Text>
          </View>
        ) : (
          <RequestedDataSelector
            name={item.title} // Not the best to use the message title but better than nothing for the moment
            schemaUrl={requestSchema}
            userSelect={!!userSelect}
            fallbackAction={fallbackAction}
            onPress={onItemPress}
            selectedItems={selectedItems}
          />
        )}
      </View>
      {status ? null : (
        <BottomActionBar
          actions={[
            {
              variant: 'secondary',
              label: 'Decline',
              onPress: () => handleAction('decline'),
              disabled:
                !!status ||
                currentAction === 'accept' ||
                currentAction === 'decline',
            },
            {
              label: 'Share',
              onPress: () => handleAction('accept'),
              disabled:
                !shareEnabled ||
                !!status ||
                currentAction === 'accept' ||
                currentAction === 'decline',
            },
          ]}
        />
      )}
    </View>
  )
}

export default DataRequest

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  senderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  statusContainer: {
    flexDirection: 'row',
    marginVertical: 30,
    bottom: 0,
  },
  status: {
    flex: 0.5,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  statusDecline: {
    backgroundColor: DECLINE_COLOR,
  },
  statusAccept: {
    backgroundColor: ACCEPT_COLOR,
  },
})
