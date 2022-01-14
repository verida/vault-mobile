import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Layout from '../../components/Layouts/Layout'
import Button from '../../components/Button'
import Text from '../Text'
import Description from './Description'
import { ACCEPT_COLOR, DECLINE_COLOR } from '../../constants/color'

import { NUNITO_SANS_BOLD } from '../../constants/text'

export default ({
  type,
  item,
  inboxItem,
  onResultClick,
  children,
  currentAction = null,
}) => {
  const description = {
    name: item.item.message,
    createdAt: item.createdAt,
  }

  return (
    <Layout style={style.layout}>
      <View style={style.header}>
        <Text style={style.title}>{type.title}</Text>
        {type.svg && type.svg(40, 40, style.svg)}
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
      ) : (
        <View style={style.action}>
          <Button
            color='grey'
            style={style.btn}
            onPress={() => onResultClick('decline')}
            loading={currentAction === 'decline'}>
            Decline
          </Button>
          <Button
            style={{ ...style.btn, marginLeft: 20 }}
            onPress={() => onResultClick('accept')}
            loading={currentAction === 'accept'}>
            Accept
          </Button>
        </View>
      )}
    </Layout>
  )
}

const style = StyleSheet.create({
  layout: {
    flex: 1,
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
  btn: {
    flex: 0.5,
    height: 40,
  },
  svg: {
    position: 'absolute',
    right: 0,
    top: 25,
  },
})
