import { EnvironmentType } from '@verida/types'
import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import { IdentityAvatar } from '~/components/Images'
import { Checkmark } from '~/components/Indicators'
import { useTheme } from '~/contexts'
import { getAddressFromDID, getNetworkFromDID } from '~/features/identities'
import { PROFILE_EMPTY_NAME_VALUE, PublicProfile } from '~/features/profiles'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type DrawerIdentityListItemProps = {
  did: string
  profile: PublicProfile
  isCurrent: boolean
  onPress?: (did: string) => void
}

export const DrawerIdentityListItem: React.FunctionComponent<
  DrawerIdentityListItemProps
> = (props) => {
  const { did, profile, isCurrent, onPress } = props
  const network = did ? getNetworkFromDID(did) : EnvironmentType.MAINNET
  const displayedDid = getAddressFromDID(did)

  const isNameEmpty = !profile.name
  const displayedName = profile.name || PROFILE_EMPTY_NAME_VALUE

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const handlePress = useCallback(() => {
    onPress?.(did)
  }, [onPress, did])

  return (
    <TouchableHighlight
      disabled={isCurrent}
      onPress={handlePress}
      underlayColor={theme.color.snow}>
      <View style={[styles.container, isCurrent && styles.current]}>
        <IdentityAvatar
          source={profile.avatar?.uri}
          network={network}
          networkIndicatorSize='compact'
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text
            style={isNameEmpty ? [styles.name, styles.emptyName] : styles.name}
            numberOfLines={1}
            ellipsizeMode='tail'>
            {displayedName}
          </Text>
          <Text style={styles.did} numberOfLines={1} ellipsizeMode='middle'>
            {displayedDid}
          </Text>
        </View>
        {isCurrent ? (
          <View style={styles.checkmark}>
            <Checkmark />
          </View>
        ) : null}
      </View>
    </TouchableHighlight>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.m,
      paddingLeft: 20,
      paddingRight: theme.spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
    },
    current: {
      backgroundColor: theme.color.snow,
    },
    avatar: {
      width: 45,
      aspectRatio: 1,
    },
    nameContainer: {
      flex: 1,
      marginLeft: theme.spacing.m,
    },
    name: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.l,
      lineHeight: theme.fontSize.l * 1.5,
    },
    emptyName: {
      color: theme.color.textLightGrey,
      fontStyle: 'italic', // FIXME: Italic not applied
    },
    did: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.s,
      lineHeight: theme.fontSize.s * 1.5,
      color: theme.color.textLightGrey,
    },
    checkmark: {
      marginLeft: theme.spacing.s,
    },
  })
