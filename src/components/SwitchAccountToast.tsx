import { selectSwitchAccountToast } from 'features/identities'
import React from 'react'
import { Dimensions, StyleSheet, View, ViewProps } from 'react-native'
import { useSelector } from 'react-redux'

import { Avatar } from 'components/Images'
import Text from 'components/Text'
import { GREY_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

const { width: DEVICE_WIDTH } = Dimensions.get('window')
const MARGIN_HORIZONTAL = 16

function SwitchAccountToast(props: Omit<ViewProps, 'children'>) {
  const { style, ...rest } = props
  const data = useSelector(selectSwitchAccountToast)

  if (!data) {
    return null
  }

  return (
    <View style={[styles.container, style]} {...rest}>
      <Avatar
        source={data.avatar}
        style={styles.avatar}
        fallbackType='person'
      />
      <Text style={styles.text}>
        Switched to <Text style={styles.name}>{data.name}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#041133',
    padding: 10,
    position: 'absolute',
    left: MARGIN_HORIZONTAL,
    bottom: 90,
    width: DEVICE_WIDTH - MARGIN_HORIZONTAL * 2,
    borderRadius: 3,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    color: GREY_COLOR,
  },
  name: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
  },
})

export default SwitchAccountToast
