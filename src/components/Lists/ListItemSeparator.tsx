import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export const ListItemSeparator: React.FC = () => {
  const styles = useThemeAwareStyle(createStyles)

  return <View style={styles.separator} />
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
  })
