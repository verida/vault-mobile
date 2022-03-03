import { useIsFocused } from '@react-navigation/native'
import { editable } from 'helpers/profile'
import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import AccountManager from 'api/AccountManager'
import ProfileLayout from 'components/Layouts/ProfileLayout'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { setPublicProfileData } from 'reduxStore/general/actions'

const PublicProfile = (props: any) => {
  const [list, setList] = useState([
    { label: 'Name', value: '', action: 'arrow', type: 'input' },
    { label: 'Country', value: '', action: 'arrow', type: 'select' },
    { label: 'Description', value: '', action: 'arrow', type: 'textarea' },
  ])
  const [initialized, setInitialized] = useState(false)
  const isFocused = useIsFocused()
  const [loading, setLoading] = useState(false)

  // component did mount
  useEffect(() => {
    const updateData = async (shouldUpdate: boolean) => {
      try {
        if (initialized) {
          return
        }
        let publicData: any = {}
        if (shouldUpdate || props.publicProfileData?.name === '') {
          setLoading(true)
          const vault = AccountManager.getInstance().vault as any
          if (vault.profiles.public.data)
            publicData = vault.profiles.public.data
          else publicData = await vault.profiles.public.getMany()
          setLoading(false)
        } else {
          publicData = props.publicProfileData
        }

        props.setPublicProfileData(publicData)
        const updatedList = list.map((item: any) => {
          const label = item.label.toLowerCase()
          if (publicData[label]) {
            item.value = publicData[label]
          }
          return item
        })

        setList(updatedList)
        setInitialized(true)
      } catch (e) {
        Alert.alert('Error', 'Cannot load public profile data')
      }
    }

    const bindChanges = async () => {
      const vault = AccountManager.getInstance().vault as any
      await vault.profiles.public.init()
      const db = await vault.profiles.public.store.getDb()
      const dbInstance = await db.getInstance()
      dbInstance
        .changes({
          since: 'now',
          live: true,
        })
        .on('change', async function () {
          updateData(true)
        })
    }

    updateData(false)
    bindChanges()
  }, [initialized, list, props])

  useEffect(() => {
    setInitialized(false)
  }, [isFocused])

  return (
    <View>
      <NavigationHeader title='Public Profile' />
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingView />
        </View>
      ) : (
        <ProfileLayout
          list={editable(list)}
          description={'This profile is public and can be discovered by others'}
        />
      )}
    </View>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setPublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

const mapStateToProps = (state: any) => {
  return {
    publicProfileData: state.publicProfileData,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicProfile)

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.8,
  },
})
