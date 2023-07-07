import { selectAccounts } from 'features/identities'
import {
  fetchAllPublicProfilesData,
  fetchPublicProfileData,
  PublicProfile,
  selectPublicProfiles,
  selectPublicProfilesLoadingState,
} from 'features/profiles'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { Account } from 'api/types'
// import { fetchPublicProfileData } from 'api/utils'
import LoadingView from 'components/LoadingView'
import AccountItem from 'pages/Dashboard/AccountsList/AccountItem'

export type AccountsListProps = {
  containerStyle: ViewStyle
  onSelectAccount: (did: string) => void
  selectedDids: string[]
  multipleSelect?: boolean
  showSelectedOnly?: boolean
}

function AccountsList(props: AccountsListProps) {
  const {
    onSelectAccount,
    containerStyle,
    selectedDids = [],
    multipleSelect,
    showSelectedOnly,
  } = props
  const [data, setData] = useState<Account[]>([])
  // const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const publicProfiles = useSelector(selectPublicProfiles)
  const accounts = useSelector(selectAccounts)
  const accountIds = useMemo(() => {
    if (showSelectedOnly) {
      return Object.keys(accounts).filter((did) => selectedDids.includes(did))
    }
    return Object.keys(accounts)
  }, [accounts, selectedDids, showSelectedOnly])

  useEffect(() => {
    async function fetchData() {
      // setLoading(true)
      let normalizedData = {} //await fetchPublicProfileData()
      if (showSelectedOnly) {
        const selectedData: any = {}
        Object.keys(normalizedData).map((key) => {
          if (selectedDids.includes(key)) {
            selectedData[key] = normalizedData[key]
          }
        })
        normalizedData = selectedData
      }

      setData(Object.values(normalizedData))
      // setLoading(false)
    }

    // fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSelectedOnly])

  useEffect(() => {
    ;(() => {
      dispatch(fetchAllPublicProfilesData())
    })()
  }, [dispatch])

  const renderDivider = () => <View style={styles.divider} />

  const renderItem = useCallback(
    ({ item: did }: ListRenderItemInfo<string>) => {
      // const { did, publicProfile = {} } = info.item
      const publicProfile = publicProfiles[did]

      const { name = '', avatar = undefined } = publicProfile || {}

      const selected = selectedDids.indexOf(did) !== -1

      return (
        <AccountItem
          onSelect={onSelectAccount}
          name={name}
          did={did}
          avatar={avatar}
          selected={selected}
          multipleSelect={multipleSelect}
        />
      )
    },
    [publicProfiles, selectedDids, onSelectAccount, multipleSelect]
  )

  return (
    <FlatList<string>
      data={accountIds}
      renderItem={renderItem}
      contentContainerStyle={containerStyle}
      ItemSeparatorComponent={renderDivider}
      showsVerticalScrollIndicator={true}
    />
  )
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3C3C43',
    opacity: 0.4,
  },
  loadingContainer: {
    paddingVertical: 40,
  },
})

export default AccountsList
