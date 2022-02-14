import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

import { Account, UserData } from 'api/types'
import { fetchPublicProfileData } from 'api/utils'
import LoadingView from 'components/LoadingView'
import AccountItem from 'pages/Dashboard/AccountsList/AccountItem'

export type AccountsListProps = {
  containerStyle: ViewStyle
  onSelectAccount: (did: string) => void
  selectedDids: string[]
}

function AccountsList(props: AccountsListProps) {
  const { onSelectAccount, containerStyle, selectedDids = [] } = props
  const [data, setData] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const normalizedData = await fetchPublicProfileData()
      setData(Object.values(normalizedData))
      setLoading(false)
    }

    fetchData()
  }, [])

  const renderDivider = () => <View style={styles.divider} />

  const renderItem = useCallback(
    (info: ListRenderItemInfo<Account>) => {
      const { did, publicProfile = {} } = info.item

      const { name = '', avatar = undefined } = publicProfile as UserData

      const selected = selectedDids.indexOf(did) !== -1

      return (
        <AccountItem
          onSelect={onSelectAccount}
          name={name}
          did={did}
          avatar={avatar}
          selected={selected}
        />
      )
    },
    [onSelectAccount, selectedDids]
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingView type={'small'} />
      </View>
    )
  }

  return (
    <FlatList<Account>
      data={data}
      renderItem={renderItem}
      contentContainerStyle={containerStyle}
      ItemSeparatorComponent={renderDivider}
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
