import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { FlatList, FlatListProps, StyleSheet } from 'react-native'

import { Spacer } from 'components/Spacer'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

interface GridProps<ItemT> extends FlatListProps<ItemT> {
  numberOfColumns: number
}

function GridView<ItemT>({ numberOfColumns, ...rest }: GridProps<ItemT>) {
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <FlatList<ItemT>
      style={styles.grid}
      numColumns={numberOfColumns}
      contentContainerStyle={{
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
      }}
      columnWrapperStyle={styles.columnWrapperStyle}
      ItemSeparatorComponent={() => <Spacer vertical='m' />}
      showsVerticalScrollIndicator={false}
      {...rest}
    />
  )
}

GridView.defaultProps = {
  numberOfColumns: 2,
}

export default GridView

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    grid: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    columnWrapperStyle: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
