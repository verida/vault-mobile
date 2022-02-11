import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, View } from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import AccountManager from 'api/AccountManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import ProfileLayout from '../../components/Layouts/ProfileLayout'
import { editable } from '../../helpers/profile'
import { setPublicProfileData as setPublicProfileDataAction } from '../../reduxStore/general/actions'

const PublicProfile = (props: any) => {
  const [list, setList] = useState([
    { label: 'Name', value: '', action: 'arrow', type: 'input' },
    { label: 'Country', value: '', action: 'arrow', type: 'select' },
    { label: 'Description', value: '', action: 'arrow', type: 'textarea' },
  ])
  const [initialized, setInitialized] = useState(false)
  const isFocused = useIsFocused()
  const { publicProfileData, setPublicProfileData } = props

  // component did mount
  useEffect(() => {
    const updateData = async (shouldUpdate: boolean) => {
      try {
        if (initialized) {
          return
        }
        let publicData: any = {}
        if (shouldUpdate || publicProfileData?.name === '') {
          const vault = AccountManager.getInstance().vault as any
          publicData = await vault.profiles.public.getMany()
        } else {
          publicData = publicProfileData
        }

        setPublicProfileData(publicData)
        const updatedList = list.map((item) => {
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
  }, [initialized, list, setPublicProfileData, publicProfileData])

  useEffect(() => {
    setInitialized(false)
  }, [isFocused])

  return (
    <View>
      <NavigationHeader title='Public Profile' />
      <ProfileLayout
        list={editable(list)}
        description={'This profile is public and can be discovered by others'}
      />
    </View>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    setPublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileDataAction(data)),
  }
}

const mapStateToProps = (state: any) => {
  return {
    publicProfileData: state.publicProfileData,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicProfile)
