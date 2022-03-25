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

const PublicProfile = ({ publicProfileData, updatePublicProfileData }: any) => {
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
        if (shouldUpdate || publicProfileData?.name === '') {
          setLoading(true)
          const vault = AccountManager.getInstance().vault as any
          publicData = await vault.profiles.public.getMany()
          setLoading(false)
        } else {
          publicData = publicProfileData
        }

        updatePublicProfileData(publicData)
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

    const watchChanges = async () => {
      const vault = AccountManager.getInstance().vault as any
      vault.profiles.public?.listen(() => {
        updateData(true)
      })
    }

    updateData(false)
    watchChanges()
  }, [initialized, list, publicProfileData, updatePublicProfileData])

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
    updatePublicProfileData: (data: unknown) =>
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
