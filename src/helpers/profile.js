const edit = (navigation, option) =>
  navigation.navigate('EditProfile', { title: option.label, option })
export const editable = (list) =>
  list.map((option) => ({
    ...option,
    onPress: (navigation) =>
      option.onPress ? option.onPress(option) : edit(navigation, option),
  }))
