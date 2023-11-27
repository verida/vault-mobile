import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR } from '../../constants/color'
import Text from '../Text'

export default ({ words, template, onSelect, id, containerStyle }) => {
  let displayWords = []
  words.forEach((word, index) => {
    if (id === 'selected' && template.indexOf(index) !== -1) {
      displayWords = template
    } else if (id !== 'selected' && template.indexOf(index) === -1) {
      displayWords.push(index)
    }
  })

  return displayWords.map((value, index) => (
    <TouchableOpacity
      key={`${id} - ${index}`}
      style={[style.word, containerStyle]}
      onPress={() => onSelect(value)}>
      <Text>{words[value]}</Text>
    </TouchableOpacity>
  ))
}

const style = StyleSheet.create({
  word: {
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    marginBottom: 10,
    flexShrink: 1,
  },
  selected: {
    backgroundColor: BLACK_COLOR_OPACITY(0.05),
    borderColor: BLACK_COLOR_OPACITY(0),
    opacity: 0.5,
  },
  selectedText: {
    color: BLACK_COLOR_OPACITY(0.5),
  },
})
