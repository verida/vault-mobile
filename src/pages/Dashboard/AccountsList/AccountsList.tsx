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
  multipleSelect?: boolean,
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      let normalizedData = await fetchPublicProfileData()
      if(showSelectedOnly){
        console.log('Ented here')
        const selectedData: any = {}
        Object.keys(normalizedData).map((key) => {
          if(selectedDids.includes(key)){
            console.log('here')
            selectedData[key] = normalizedData[key]
          }
        })
        normalizedData = selectedData
      }
      
      setData(Object.values(normalizedData))
      setLoading(false)
    }

    fetchData()
  }, [showSelectedOnly])

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
          multipleSelect={multipleSelect}
        />
      )
    },
    [onSelectAccount, selectedDids, multipleSelect, showSelectedOnly]
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
