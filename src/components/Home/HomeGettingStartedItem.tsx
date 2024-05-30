import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native'

import { Icon } from '~/components'
import { HomeScreenGettingStartedItem } from '~/features/homeScreen'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type HomeGettingStartedItemProps = {
  item: HomeScreenGettingStartedItem
} & ViewProps

export const HomeGettingStartedItem: React.FC<HomeGettingStartedItemProps> = (
  props
) => {
  const { item, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  const navigation = useNavigation()

  const handlePress = () => {
    navigation.navigate(item.screen as never) // Expecting potential params
    // TODO: Either Add screen params in the item definition or be careful not to put a screen with mandatory params
  }

  return (
    <View {...viewProps}>
      <Pressable style={styles.container} onPress={handlePress}>
        <View style={styles.details}>
          {item.icon}
          <Text style={styles.label}>{item.label}</Text>
        </View>
        <Icon name='chevron-forward' size={24} />
      </Pressable>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      borderWidth: 1,
      borderRadius: theme.roundness.xs,
      borderColor: '#E0E3EA', // Hardcoded color
      backgroundColor: theme.color.background,
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      marginLeft: theme.spacing.sm,
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.375,
      color: theme.color.onBackground,
    },
  })
