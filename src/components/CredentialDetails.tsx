import React from 'react'
import { StyleSheet, View } from 'react-native'

import { BLACK_COLOR_OPACITY } from '~/constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'

import Label from './Label'
import Text from './Text'

const info = [
  {
    title: 'Name',
    value: 'Robert Brown',
  },
  {
    title: 'Date of birth',
    value: '03/03/86',
  },
  {
    title: 'Test type',
    value: 'COVID-19 PCR',
  },
  {
    title: 'Test result',
    value: 'Negative',
  },
  {
    title: 'Issued by',
    value: 'SA Pathology, Adelaide City',
  },
]

const CredentialDetails = () => {
  const details = info.map((item) => (
    <View key={item.title}>
      <Label style={style.label}>{item.title}:</Label>
      <Text style={style.text}>{item.value}</Text>
    </View>
  ))

  return (
    <View style={style.container}>
      <Text style={style.title}>Test Details</Text>
      {details}
    </View>
  )
}

export default CredentialDetails

const style = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: NUNITO_SANS_BOLD,
    lineHeight: 25,
  },
  label: {
    color: BLACK_COLOR_OPACITY(0.6),
    fontSize: 14,
    lineHeight: 19,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})
