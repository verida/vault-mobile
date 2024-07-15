import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { get, isEmpty } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Linking, StyleSheet, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { DefaultAvatar, getPublicProfile } from '~/api/utils'
import MailSvg from '~/assets/icons/mail.svg'
import { BottomActionBar } from '~/components/ScreenLayouts'
import { ShimmerPlaceholder } from '~/components/ShimmerPlaceholder'
import Text from '~/components/Text'
import { Typography } from '~/components/Typography'
import { NUNITO_SANS_BOLD } from '~/constants/text'
import { Logger } from '~/features/telemetry'
import { useEmitter, useThemeAwareStyle } from '~/hooks'
import { MainStackParams } from '~/navigation/types'
import { Theme } from '~/styles/types'

const logger = Logger.create('Component/GenericMessage')

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
  const [submitting, setSubmitting] = useState<boolean>(false)

  const styles = useThemeAwareStyle(createStyles)

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
      await vault?.inbox.handleAction(inboxItem, 'accept', {})
      setSubmitting(false)
      navigation.goBack()
    } catch (error) {
      setSubmitting(false)
      Alert.alert(
        'Error',
        'Something went wrong when marking the message as read'
      )
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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MailSvg />
          <Typography variant='h3' numberOfLines={1} ellipsizeMode='tail'>
            {itemData.subject}
          </Typography>
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
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{itemData.message}</Text>
        </View>
      </View>
      <BottomActionBar
        actionsOrientation='column'
        actions={
          itemData.link
            ? [
                {
                  variant: 'primary',
                  label: itemData.link.text,
                  onPress: () => openLink(itemData.link.url),
                },
                {
                  variant: 'secondary',
                  label: 'Mark as read',
                  onPress: onSubmit,
                  disabled: submitting,
                },
              ]
            : [
                {
                  variant: 'secondary',
                  label: 'Mark as read',
                  onPress: onSubmit,
                  disabled: submitting,
                },
              ]
        }
      />
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
    },
    title: {
      fontSize: 22,
      fontFamily: NUNITO_SANS_BOLD,
    },
    senderContainer: {
      borderWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.color.separator,
      borderBottomColor: theme.color.separator,
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.m,
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
    messageContainer: {
      flex: 1,
      padding: theme.spacing.m,
    },
    message: {
      color: 'rgba(129, 136, 153, 1)',
      fontSize: 14,
    },
  })

export default GenericMessage
