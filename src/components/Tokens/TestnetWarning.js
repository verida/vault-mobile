import React from 'react'
import { StyleSheet, View } from 'react-native'

import Text from 'components/Text'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { WHITE_COLOR, WARNING_COLOR } from 'constants/color'

export default () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Using Algorand Testnet</Text>
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
