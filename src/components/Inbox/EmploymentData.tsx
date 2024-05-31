import React from 'react'
import { StyleSheet, View } from 'react-native'

import Text from '~/components/Text'
import { BLACK_COLOR_OPACITY } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'

export interface EmploymentDataProps {
  label: string
  value: string
}

const EmploymentData: React.FC<EmploymentDataProps> = (props) => {
  const { label, value } = props
  return (
    <View style={{ flex: 0.5 }}>
      <Text style={style.label}>{label}</Text>
      <Text style={style.value}>{value}</Text>
    </View>
  )
}

export default EmploymentData

const style = StyleSheet.create({
  label: {
    color: BLACK_COLOR_OPACITY(0.6),
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 15,
  },
  value: {
    fontSize: 17,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    marginTop: 4,
  },
})
