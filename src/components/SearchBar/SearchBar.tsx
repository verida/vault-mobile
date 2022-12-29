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
}

export function SearchBar(props: SearchBarProps) {
  const { style, inputProps, ...rest } = props
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
      <Pressable
        style={styles.buttonIccon}
        onPress={() => Alert.alert('Manage sorts')}>
        <SortIcon />
      </Pressable>
      <Pressable
        style={styles.buttonIccon}
        onPress={() => Alert.alert('Manger filters')}>
        <FilterIcon />
      </Pressable>
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
