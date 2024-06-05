import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import _ from 'underscore'

import Text from '~/components/Text'
import { BLACK_COLOR_OPACITY, PRIMARY_COLOR } from '~/constants/color'

interface FiltersProps {
  filters: any
}

const Filters: React.FC<FiltersProps> = ({ filters }) => {
  const [showAll, setShowAll] = useState<boolean>(false)
  const [primary, secondary] = _.partition(
    filters,
    (_item: any, i: number) => i < 2
  )

  const showBtn = (
    <TouchableOpacity onPress={() => setShowAll(!showAll)}>
      <Text style={style.hidden}>
        {!showAll ? secondary.length + ' more filters' : 'show less'}
      </Text>
    </TouchableOpacity>
  )
  const show = (list: any[], k: string) =>
    list.map((item, index) => (
      <Text style={style.text} key={`${k} - ${index}`}>
        {item}
      </Text>
    ))

  return (
    <View>
      {show(primary, 'primary')}
      {Boolean(secondary.length) && showAll && show(secondary, 'secondary')}
      {Boolean(secondary.length) && showBtn}
    </View>
  )
}

export default Filters

const style = StyleSheet.create({
  text: {
    color: BLACK_COLOR_OPACITY(0.5),
    fontSize: 15,
    lineHeight: 22,
  },
  hidden: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    marginTop: 8,
  },
})
