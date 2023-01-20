import * as Sentry from '@sentry/react-native'
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

const PublicProfile = ({ publicProfileData, updatePublicProfileData }: any) => {
  const [list, setList] = useState([
    { label: 'Name', value: '', action: 'arrow', type: 'input' },
    { label: 'Country', value: '', action: 'arrow', type: 'select' },
    { label: 'Description', value: '', action: 'arrow', type: 'textarea' },
  ])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const vault = AccountManager.getInstance().vault as any
      const publicData = await vault.profiles.public.getMany()

      updatePublicProfileData(publicData || publicProfileData)
      const updatedList = list.map((item: any) => {
        const label = item.label.toLowerCase()
        if (publicData[label]) {
          item.value = publicData[label]
        }
        return item
      })

      setList(updatedList)
      setLoading(false)
    } catch (e) {
      Sentry.captureException(e)
      Alert.alert('Error', 'Cannot load public profile data')
    }
  }

  // component did mount
  useEffect(() => {
    fetchData()

    let listener: any
    const watchChanges = async () => {
      const vault = AccountManager.getInstance().vault as any
      await vault.profiles.public.init()
      const db = await vault.profiles.public.store.getDb()
      const dbInstance = db.db
      listener = dbInstance
        .changes({
          since: 'now',
          live: true,
        })
        .on('change', () => {
          fetchData()
        })
    }
    watchChanges()
    return () => {
      listener?.cancel()
    }
    // Register profile change listener one time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    updatePublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
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
