import React from 'react'
import { StyleSheet, View } from 'react-native'

import Success from '~/assets/success.svg'
import Text from '~/components/Text'
import { WHITE_COLOR } from '~/constants/color'

export interface EmptyListProps {
  type: string
  approved?: boolean
}

const EmptyList: React.FC<EmptyListProps> = ({ type, approved }) => (
  <View style={style.container}>
    <Text style={style.text}>You have no {type} requests</Text>
    {approved && (
      <View style={style.card}>
        <Success width={40} />
        <Text style={style.title}>Request Approved</Text>
      </View>
    )}
  </View>
)

export default EmptyList

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  card: {
    position: 'absolute',
    top: '25%',
    borderRadius: 8,
    paddingHorizontal: 36,
    paddingBottom: 20,
    backgroundColor: WHITE_COLOR,
    borderColor: 'lightgrey',
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
})
