import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Logger } from 'features/telemetry'
import { useEmitter } from 'hooks'
import { get, isEmpty } from 'lodash'
import moment from 'moment'
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Linking, StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import { DefaultAvatar, getPublicProfile } from 'api/utils'
import MailSvg from 'assets/icons/mail.svg'
import Button from 'components/Button'
import { ShimmerPlaceholder } from 'components/ShimmerPlaceholder'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { MainStackParams } from 'navigation/types'

import Text from '../../Text'

const logger = new Logger('Component/GenericMessage')

type GenericMessageProps = {
  inboxItem: any
  navigation: NativeStackNavigationProp<MainStackParams>
}

type Sender = {
  name: string
  avatar: any // what should this be?

  // transient prop
  isLoading?: boolean
}

const defaultSender: Sender = {
  name: 'Unknown',
  avatar: DefaultAvatar,
}

function GenericMessage(props: GenericMessageProps) {
  const { inboxItem, navigation } = props
  const [sender, setSender] = useState<Sender>(defaultSender)
  const [submitting, setSubmitting] = useState(false)

  const fetchSenderData = React.useCallback(async () => {
    try {
      const senderDid: string | undefined = get(inboxItem, 'sentBy.did')
      if (!senderDid) {
        return
      }
      const { name, avatar, isLoading } = await getPublicProfile(senderDid)
      setSender({
        isLoading,
        name,
        avatar,
      })
    } catch (error) {
      logger.error(error)
    }
  }, [inboxItem])

  useEmitter('PUBLIC_PROFILE_LOADED', async (event) => {
    if (event.profileId.indexOf(inboxItem?.item?.sentBy?.did) >= 0) {
      fetchSenderData()
    }
  })

  useEffect(() => {
    fetchSenderData()
  }, [fetchSenderData])

  const openLink = async (url: string) => {
    onSubmit()
    Linking.openURL(url)
  }

  const onSubmit = async () => {
    try {
      if (inboxItem.read) {
        navigation.goBack()
        return
      }
      setSubmitting(true)

      const vault = AccountManager.getInstance().vault
      const handleResult = await vault?.inbox.handleAction(
        inboxItem,
        'accept',
        {}
      )
      setSubmitting(false)
      if (!handleResult?.success) {
        Alert.alert('Error', 'Invalid schema, part of data maybe missing')
      } else {
        navigation.goBack()
      }
      setSubmitting(false)
    } catch (error) {
      setSubmitting(false)
      Alert.alert('Error', 'Can not set message as read')
      logger.error(error)
    }
  }

  const itemData = !isEmpty(inboxItem.data.data) ? inboxItem.data.data[0] : null

  if (!itemData || Object.keys(itemData).length === 0) {
    // @todo: `markRead` should exist somewhere else
    const markRead = async () => {
      const vault = AccountManager.getInstance().vault
      const messaging = await vault?.inbox.getMessaging()
      const inbox = await messaging.getInbox()
      const ds = await inbox.getInboxDatastore()
      inboxItem.read = true
      await ds.save(inboxItem)
    }

    markRead()
    return <Text>Invalid data</Text>
  }

  const formattedSentAt = moment(inboxItem.sentAt).format('MMM D, HH:mm')

  return (
    <Content>
      <View style={styles.container}>
        <View style={styles.header}>
          <MailSvg />
          <Text style={styles.title}>{itemData.subject}</Text>
        </View>
      </View>
      <View style={styles.senderContainer}>
        <ShimmerPlaceholder
          visible={!sender.isLoading}
          style={styles.senderAvatar}>
          <Image source={sender.avatar} style={styles.senderAvatar} />
        </ShimmerPlaceholder>
        <View>
          <ShimmerPlaceholder
            visible={!sender.isLoading}
            style={styles.senderName}>
            <Text style={styles.senderName}>{sender.name}</Text>
          </ShimmerPlaceholder>
          <Text style={styles.sentAt}>{formattedSentAt}</Text>
        </View>
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.message}>{itemData.message}</Text>
      </View>
      <View style={styles.footerContent}>
        {itemData.link ? (
          <View>
            <Button
              color='primary'
              style={styles.linkButton}
              onPress={() => {
                openLink(itemData.link.url)
              }}>
              {itemData.link.text}
            </Button>
          </View>
        ) : null}
        <Button
          color='grey'
          style={styles.okayButton}
          onPress={onSubmit}
          loading={submitting}>
          Mark as read
        </Button>
      </View>
    </Content>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  title: {
    fontSize: 22,
    fontFamily: NUNITO_SANS_BOLD,
    marginLeft: 24,
  },
  messageContent: {
    marginHorizontal: 15,
  },
  senderContainer: {
    marginVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60, 60, 67, 0.4)',
    borderBottomColor: 'rgba(60, 60, 67, 0.4)',
    paddingHorizontal: 15,
  },
  senderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    resizeMode: 'cover',
    marginRight: 15,
  },
  senderName: {
    fontSize: 14,
  },
  sentAt: {
    fontSize: 12,
  },
  message: {
    color: 'rgba(129, 136, 153, 1)',
    fontSize: 14,
  },
  linkButton: {
    marginHorizontal: 15,
  },
  okayButton: {
    marginHorizontal: 15,
  },
  footerContent: {
    marginTop: 38,
  },
})

export default GenericMessage
