import React from 'react'
import StravaSvg from 'assets/icons/strava.svg'
import { StyleSheet, View, ViewProps } from 'react-native'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { GREY_COLOR, LIGHTGREY_COLOR, SUCCESS_COLOR } from 'constants/color'
import moment from 'moment'
import { CheckBox } from 'react-native-elements'

export type ShareableDataItemType = {
  _id: string
  name: string
  summary: string
  time: string
}

export type ShareableDataItemProps = Omit<ViewProps, 'children'> & {
  item: ShareableDataItemType
  selected: boolean
  onSelect: (item: ShareableDataItemType) => void
}

function ShareableDataItem(props: ShareableDataItemProps) {
  const {
    item: { name, summary, time },
    selected,
    onSelect,
  } = props

  return (
    <View style={styles.item}>
      <StravaSvg />
      <View style={styles.itemContent}>
        <Text style={{ fontFamily: NUNITO_SANS_BOLD, fontSize: 16 }}>
          {name}
        </Text>
        <Text>{summary}</Text>
        <Text>{moment(time).format('DD MMM YYYY, HH:mm')}</Text>
      </View>
      <CheckBox
        containerStyle={styles.checkbox}
        iconType='material'
        checkedIcon='check-circle'
        uncheckedIcon='radio-button-unchecked'
        checkedColor={SUCCESS_COLOR}
        uncheckedColor={LIGHTGREY_COLOR}
        size={20}
        checked={selected}
        onPress={() => onSelect(props.item)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GREY_COLOR,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingLeft: 15,
  },
  itemContent: {
    marginLeft: 15,
    flex: 1,
  },
  checkbox: {},
})

export default ShareableDataItem
