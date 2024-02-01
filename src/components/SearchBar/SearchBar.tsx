import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInputProps,
  View,
  ViewProps,
} from 'react-native'

import FilterIcon from 'assets/icons/filter.svg'
import InlineSearchIcon from 'assets/icons/inline_search.svg'
import SortIcon from 'assets/icons/sort.svg'
import TextInput from 'components/Input/TextInput'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

interface SearchBarProps extends ViewProps {
  inputProps: TextInputProps
  showSortButton?: boolean
  showFilterButton?: boolean
}

export function SearchBar(props: SearchBarProps) {
  const {
    style,
    inputProps,
    showSortButton = true,
    showFilterButton = true,
    ...rest
  } = props
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={[styles.inputContainer]}>
        <InlineSearchIcon />
        <TextInput
          style={styles.input}
          autoCapitalize={'none'}
          returnKeyType={'search'}
          clearButtonMode={'while-editing'}
          underlineColorAndroid='transparent'
          {...inputProps}
        />
      </View>
      {Boolean(showSortButton) && (
        <Pressable
          style={styles.buttonIccon}
          onPress={() => Alert.alert('Manage sorts')}>
          <SortIcon fill={theme.color.iconDefault} />
        </Pressable>
      )}
      {Boolean(showFilterButton) && (
        <Pressable
          style={styles.buttonIccon}
          onPress={() => Alert.alert('Manger filters')}>
          <FilterIcon fill={theme.color.iconDefault} />
        </Pressable>
      )}
    </View>
  )
}

SearchBar.defaultProps = {
  inputProps: {},
} as SearchBarProps

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderRadius: theme.roundness.m,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.s,
      height: 36,
      backgroundColor: theme.color.grey120,
    },
    input: {
      flex: 1,
      flexDirection: 'row',
      height: 36,
      marginLeft: theme.spacing.s,
      fontSize: theme.fontSize.sl,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
      margin: 0,
    },
    buttonIccon: {
      marginLeft: theme.spacing.m,
    },
  })
