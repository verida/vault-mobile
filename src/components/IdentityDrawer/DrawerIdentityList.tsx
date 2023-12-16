import { selectAccounts, selectSelectedAccount } from 'features/identities'
import {
  fetchAllPublicProfilesData,
  PublicProfile,
  selectPublicProfiles,
} from 'features/profiles'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect } from 'react'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'

import { useAppDispatch, useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

import { DrawerIdentityListItem } from './DrawerIdentityListItem'

type IdentityItem = {
  did: string
  profile: PublicProfile
}

export type DrawerIdentityListProps = ViewProps

export const DrawerIdentityList: React.FunctionComponent<DrawerIdentityListProps> =
  (props) => {
    const { ...viewProps } = props

    const styles = useThemeAwareStyle(createStyles)

    const dispatch = useAppDispatch()
    useEffect(() => {
      const promise = dispatch(fetchAllPublicProfilesData())
      return () => {
        promise?.abort()
      }
    }, [dispatch])

    const identities = useAppSelector(selectAccounts)
    const identityDids = Object.keys(identities)

    const currentIdentity = useAppSelector(selectSelectedAccount)
    const publicProfiles = useAppSelector(selectPublicProfiles)
    const identityProfiles: IdentityItem[] = Object.entries(publicProfiles)
      .filter(([did]) => identityDids.includes(did)) // Cache issue in selectPublicProfiles after removing identities, the profiles stays. Have to get the list of identities with selectAccounts and keep only the profile from DID still here
      .map(([did, profile]) => ({
        did,
        profile,
      }))

    const renderItem = useCallback(
      ({ item: identity }: ListRenderItemInfo<IdentityItem>) => {
        const current = identity.did === currentIdentity?.did
        return (
          <DrawerIdentityListItem
            did={identity.did}
            profile={identity.profile}
            isCurrent={current}
          />
        )
      },
      [currentIdentity]
    )

    const renderSeparator = () => <View style={styles.separator} />

    return (
      <View {...viewProps}>
        <FlatList<IdentityItem>
          data={identityProfiles}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={true}
        />
      </View>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: theme.color.lightGrey,
    },
  })
