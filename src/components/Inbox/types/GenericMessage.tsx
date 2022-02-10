import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { get, isEmpty } from 'lodash'
import moment from 'moment'
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, Image, StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import { DefaultAvatar, getProfile } from 'api/utils'
import MailSvg from 'assets/icons/mail.svg'
import Button from 'components/Button'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { MainStackParams } from 'navigation/types'

import Text from '../../Text'

type GenericMessageProps = {
  inboxItem: any
  navigation: NativeStackNavigationProp<MainStackParams>
}

type Sender = {
  name: string
  avatar: string | null
}

const defaultSender: Sender = {
  name: 'Unknown',
  avatar: null,
}

function GenericMessage(props: GenericMessageProps) {
  const { inboxItem, navigation } = props

  const [sender, setSender] = useState<Sender>(defaultSender)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchSenderData() {
      try {
        const senderDid: string | undefined = get(inboxItem, 'sentBy.did')
        if (!senderDid) {
          return
        }
        const { name, avatar } = await getProfile(senderDid)
        setSender({
          name,
          avatar,
        })
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    fetchSenderData()
  }, [inboxItem])

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
    } catch (e) {
      setSubmitting(false)
      Alert.alert('Error', 'Can not set message as read')
      Sentry.captureException(e)
    }
  }

  const itemData = !isEmpty(inboxItem.data.data) ? inboxItem.data.data[0] : null

  if (!itemData) {
    return <Text>Invalid data</Text>
  }

  const formattedSendAt = moment(inboxItem.sendAt).format('MMM D, HH:mm')

  return (
    <Content>
      <View style={styles.container}>
        <View style={styles.header}>
          <MailSvg />
          <Text style={styles.title}>{itemData.subject}</Text>
        </View>
      </View>
      <View style={styles.senderContainer}>
        <Image
          source={
            typeof sender.avatar === 'object' ? sender.avatar : DefaultAvatar
          }
          style={styles.senderAvatar}
        />
        <View>
          <Text style={styles.senderName}>{sender.name}</Text>
          <Text style={styles.sendAt}>{formattedSendAt}</Text>
        </View>
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.message}>{itemData.message}</Text>
      </View>
      <Button
        color='grey'
        style={styles.okayButton}
        onPress={onSubmit}
        loading={submitting}>
        Okay
      </Button>
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
  sendAt: {
    fontSize: 12,
  },
  message: {
    color: 'rgba(129, 136, 153, 1)',
    fontSize: 14,
  },
  okayButton: {
    marginHorizontal: 15,
    marginTop: 38,
  },
})

export default GenericMessage
