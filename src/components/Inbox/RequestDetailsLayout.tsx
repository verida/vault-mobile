import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { InboxEntry } from '~/api/VaultCommon/interfaces/inbox/Inbox'
import { DataAction } from '~/api/VaultCommon/managers/inbox/DataAction'
import { BottomActionBar } from '~/components/ScreenLayouts'
import Text from '~/components/Text'
import { ACCEPT_COLOR, DECLINE_COLOR } from '~/constants/color'
import { NUNITO_SANS_BOLD } from '~/constants/text'

import Description from './Description'

export interface RequestDetailsLayoutProps {
  type: Record<string, any>
  item: Record<string, any>
  inboxItem: InboxEntry
  onResultClick: (action: keyof DataAction) => void
  currentAction?: string | null
}

const RequestDetailsLayout: React.FC<RequestDetailsLayoutProps> = (props) => {
  const {
    type,
    item,
    inboxItem,
    onResultClick,
    children,
    currentAction = null,
  } = props
  const description = {
    name: item.item.message,
    createdAt: item.createdAt,
    logo: item.logo,
  }

  return (
    <View style={style.container}>
      <View style={style.content}>
        <View style={style.header}>
          <Text style={style.title}>{type.title}</Text>
        </View>
        <Description details={description} />
        <ScrollView>{children}</ScrollView>
        {inboxItem.data.status ? (
          <View style={[style.action, { justifyContent: 'center' }]}>
            <Text
              style={[
                style.result,
                inboxItem.data.status === 'accept'
                  ? style.resultAccept
                  : style.resultDecline,
              ]}>
              {inboxItem.data.status === 'accept' ? 'Accepted' : 'Declined'}
            </Text>
          </View>
        ) : null}
      </View>
      {!inboxItem.data.status ? (
        <BottomActionBar
          actions={[
            {
              variant: 'secondary',
              label: 'Decline',
              onPress: () => onResultClick('decline'),
              disabled:
                currentAction === 'accept' || currentAction === 'decline',
            },
            {
              variant: 'primary',
              label: 'Accept',
              onPress: () => onResultClick('accept'),
              disabled:
                currentAction === 'accept' || currentAction === 'decline',
            },
          ]}
        />
      ) : null}
    </View>
  )
}

export default RequestDetailsLayout

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    lineHeight: 41,
    fontFamily: NUNITO_SANS_BOLD,
    marginTop: 24,
    paddingRight: 60,
  },
  result: {
    flex: 0.5,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  resultDecline: {
    backgroundColor: DECLINE_COLOR,
  },
  resultAccept: {
    backgroundColor: ACCEPT_COLOR,
  },
  action: {
    flexDirection: 'row',
    marginVertical: 30,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
    right: 0,
    top: 25,
  },
})
