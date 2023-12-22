import { getHomeGettingStartedItems } from 'features/homeScreen'
import { useCurrentIdentity } from 'features/identities'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { ScrollView, StyleSheet, Text, View, ViewProps } from 'react-native'

import { Theme } from 'styles/types'

import { HomeGettingStartedItem } from './HomeGettingStartedItem'

type HomeGettingStartedProps = ViewProps

export const HomeGettingStarted: React.FC<HomeGettingStartedProps> = (
  props
) => {
  const { ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  const currentIdentity = useCurrentIdentity()
  const homeGettingStartedItems = getHomeGettingStartedItems(
    currentIdentity?.did
  )

  if (homeGettingStartedItems.length === 0) {
    return null
  }

  return (
    <View {...viewProps}>
      <Text style={styles.headerLlabel}>What you could do next</Text>
      <ScrollView style={styles.itemsContainer}>
        {homeGettingStartedItems.map((item, index) => (
          <HomeGettingStartedItem
            key={item.key}
            item={item}
            style={index !== 0 ? styles.gap : undefined}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerLlabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.m,
      lineHeight: theme.fontSize.m * 1.5,
      color: theme.color.text70,
    },
    itemsContainer: {
      marginTop: theme.spacing.s,
    },
    gap: {
      marginTop: theme.spacing.s,
    },
  })
