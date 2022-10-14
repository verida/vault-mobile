import React from 'react'
import { StyleSheet, View } from 'react-native'

import Text from 'components/Text'
import { WARNING_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export default (props) => {
  const label = props.networkReference
    ? `Testnet (${props.networkReference})`
    : 'Testnet'
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: WARNING_COLOR, padding: 10 },
  text: {
    color: WHITE_COLOR,
    textAlign: 'center',
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})
