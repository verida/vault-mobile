import Text from 'components/Text'
import React from 'react'
import { StyleSheet, TouchableOpacity, ViewProps } from 'react-native'
import { LIGHTGREY_COLOR, SUCCESS_COLOR } from 'constants/color'
import { CheckBox } from 'react-native-elements'
import { NUNITO_SANS_BOLD } from 'constants/text'

export type NetworkType = {
  id: string
  title: string
  logo: React.Component
  disabled: boolean
}

type NetworkItemProps = Omit<ViewProps, 'children'> & {
  network: NetworkType
  selected: boolean
  onSelect: (id: string) => void
}

function NetworkItem(props: NetworkItemProps) {
  const { network, selected, style, onSelect } = props
  console.log(network)

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        network.disabled && styles.disabledContainer,
      ]}
      disabled={network.disabled}
      onPress={() => onSelect(network.id)}>
      {network.logo}
      <Text style={styles.title}>{network.title}</Text>
      <CheckBox
        iconType='material'
        checkedIcon='check-circle'
        uncheckedIcon='radio-button-unchecked'
        checkedColor={SUCCESS_COLOR}
        uncheckedColor={LIGHTGREY_COLOR}
        size={20}
        checked={selected}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    paddingVertical: 18,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
    marginLeft: 16,
    flex: 1,
  },
  disabledContainer: {
    opacity: 0.5,
  },
})

export default NetworkItem
