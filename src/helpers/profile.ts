const edit = (navigation: any, option: any) =>
  navigation.navigate('EditProfile', { title: option.label, option })

export const editable = (list: any) =>
  list.map((option: any) => ({
    ...option,
    onPress: (navigation: any) =>
      option.onPress ? option.onPress(option) : edit(navigation, option),
  }))
