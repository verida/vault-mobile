import React from 'react'
import { StyleSheet } from 'react-native'

import { LIGHTGREY_COLOR, WHITE_COLOR } from '../../constants/color'
import PropertyListItem from './PropertyListItem'

export default function PropertyList({ list }) {
  return list.map((item, index) => {
    const external = [
      style.item,
      index === 0 && style.borderRadiusTop,
      index === list.length - 1 && style.borderRadiusBottom,
    ]
    const internal = [style.property, index < list.length - 1 && style.border]

    return (
      <PropertyListItem
        key={`property-list-${index}`}
        styles={{ external, internal, text: item.text }}
        item={item}
      />
    )
  })
}
const style = StyleSheet.create({
  item: {
    backgroundColor: WHITE_COLOR,
    paddingLeft: 16,
  },
  property: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 22,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHTGREY_COLOR,
  },
  borderRadiusTop: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  borderRadiusBottom: {
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
})
