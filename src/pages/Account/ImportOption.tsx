import React from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Text from 'components/Text'
import {
  LIGHTGREY_COLOR,
  SUCCESS_COLOR,
  VERY_LIGHTGREY_COLOR,
} from 'constants/color'

export type ImportOptionProps = Omit<TouchableOpacityProps, 'children'> & {
  text: string
  selected: boolean
}

function ImportOption(props: ImportOptionProps) {
  const { text, selected, style, ...rest } = props
  return (
    <TouchableOpacity style={[styles.container, style]} {...rest}>
      <Text>{text}</Text>
      {!selected ? (
        <View style={styles.notSelectedButton} />
      ) : (
        <Ionicons
          name='checkmark-circle-sharp'
          size={24}
          color={SUCCESS_COLOR}
        />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 68,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    justifyContent: 'space-between',
  },
  notSelectedButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    backgroundColor: VERY_LIGHTGREY_COLOR,
  },
})

export default ImportOption
