import React, { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { BLACK_COLOR_OPACITY } from '~/constants/color'

const Search = () => {
  const [keyword, setKeyword] = useState<string>('')

  return (
    <TextInput
      style={style.search}
      value={keyword}
      placeholder='Search'
      onChangeText={(text: string) => setKeyword(text)}
    />
  )
}

export default Search

const style = StyleSheet.create({
  search: {
    height: 36,
    backgroundColor: BLACK_COLOR_OPACITY(0.05),
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 24,
    fontSize: 17,
    padding: 7,
  },
})
