import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { IdentityAvatar } from 'components'
import { useTheme } from 'contexts'
import { useIdentityDrawer } from 'features/identityDrawer'
import { selectSelectedPublicProfile } from 'features/profiles'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 }

export type TabScreenHeaderProps = {
  hideSeparator?: boolean
} & BottomTabHeaderProps

export const TabScreenHeader: React.FunctionComponent<TabScreenHeaderProps> = (
  props
) => {
  const { options, hideSeparator = false } = props

  const { title, headerTitle } = options

  const insets = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const { avatar } = useAppSelector(selectSelectedPublicProfile)

  const { toggle: toggleDrawer } = useIdentityDrawer()

  return (
    <>
      <StatusBar
        barStyle='dark-content'
        translucent
        backgroundColor={theme.color.background}
      />
      <View
        style={[
          styles.container,
          !hideSeparator && styles.containerSeparator,
          {
            paddingTop: insets.top,
            paddingLeft: insets.left + theme.spacing.m,
            paddingRight: insets.right + theme.spacing.m,
          },
        ]}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={toggleDrawer} hitSlop={HIT_SLOP}>
            <IdentityAvatar source={avatar?.uri} style={styles.avatar} />
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          {headerTitle ? (
            headerTitle
          ) : (
            <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>
              {title}
            </Text>
          )}
        </View>
        <View style={styles.actionsContainer} />
      </View>
    </>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.m,
      backgroundColor: theme.color.background,
      flexDirection: 'row',
      alignItems: 'center',
    },
    containerSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    avatarContainer: {
      marginVertical: theme.spacing.sm,
      marginRight: theme.spacing.m,
    },
    avatar: {
      width: 32,
      aspectRatio: 1,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      marginVertical: theme.spacing.sm,
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.sl,
      lineHeight: 32,
      textAlign: 'center',
    },
    actionsContainer: {
      marginVertical: theme.spacing.sm,
      marginLeft: theme.spacing.m + theme.spacing.s,
      flexDirection: 'row',
      alignItems: 'center',
      width: theme.iconSize.m,
    },
  })
