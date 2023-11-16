import { Logger } from 'features/telemetry'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { Content } from 'native-base'
import React, { useState } from 'react'
import { Alert, Image, StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import { DefaultAvatar } from 'api/utils'
import Button from 'components/Button'
import { RequestedDataSelector } from 'components/Inbox/RequestedDataSelector'
import CustomFooter from 'components/Layouts/CustomFooter'
import Text from 'components/Text'
import { ACCEPT_COLOR, DECLINE_COLOR, GREY_COLOR } from 'constants/color'

const logger = new Logger('Components/Inbox/types/DatabaseSync')

export default (props) => {
  const { item, navigation } = props
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
      await vault.inbox.handleAction(item.item, result, selectedItems)
      setCurrentAction(null)
      navigation.goBack()
    } catch (error) {
      Alert.alert('Error', 'Cannot sync data now')
      logger.error(error)
      setCurrentAction(null)
    }
  }

  async function onConfirmSelectedItems(items) {
    setSelectedItem(items)
  }

  const formattedSentAt = moment(item.item.sentAt).format('MMM DD, HH:mm')

  const { userSelect, requestSchema, filter, fallbackAction, status } =
    item.item.data

  const shareEnabled = (userSelect && !isEmpty(selectedItems)) || !userSelect

  function onItemPress(url) {
    navigation.navigate('ShareableData', {
      schemaUrl: url,
      onConfirm: onConfirmSelectedItems,
      filter,
    })
  }

  return (
    <>
      <Content>
        <View style={styles.container}>
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
            <View
              style={[styles.statusContainer, { justifyContent: 'center' }]}>
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
      </Content>
      {status ? null : (
        <CustomFooter>
          <View style={styles.footer}>
            <Button
              color='grey'
              style={[styles.button, styles.ignoreButton]}
              onPress={() => handleAction('decline')}
              loading={currentAction === 'decline'}
              disabled={!!status}>
              Decline
            </Button>
            <Button
              style={[styles.button, styles.shareButton]}
              onPress={() => handleAction('accept')}
              loading={currentAction === 'accept'}
              disabled={!shareEnabled || !!status}>
              Share
            </Button>
          </View>
        </CustomFooter>
      )}
    </>
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
    justifyContent: 'space-between',
    gap: 10, // Supported in RN 0.71+
  },
  button: {
    flex: 1,
  },
  ignoreButton: {
    marginRight: 5, // TODO: Remove this when gap is supported in RN 0.71
  },
  shareButton: {
    marginLeft: 5, // TODO: Remove this when gap is supported in RN 0.71
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
