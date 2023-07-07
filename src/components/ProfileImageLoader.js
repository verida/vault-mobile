import * as Sentry from '@sentry/react-native'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { selectSelectedAccount } from 'features/identities'
import {
  fetchPublicProfileData,
  selectPublicProfilesLoadingState,
  selectSelectedPublicProfile,
  setPublicProfileByDid,
} from 'features/profiles'
import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'
import { connect, useDispatch, useSelector } from 'react-redux'

import AccountManager from 'api/AccountManager'

import PhotoCameraSvg from '../assets/photo-camera.svg'

const userImg = require('assets/stubs/avatar.png')

function ProfileImageLoader(props) {
  const { publicProfileData } = props
  const dispatch = useDispatch()
  const selectAccount = useSelector(selectSelectedAccount)
  const did = selectAccount?.did
  const publicProfile = useSelector(selectSelectedPublicProfile)
  const loadingState = useSelector((state) =>
    selectPublicProfilesLoadingState(state, did)
  )
  const image = publicProfile?.avatar

  useEffect(() => {
    if (did) dispatch(fetchPublicProfileData(did))
  }, [did, dispatch])

  const loadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
        base64: true,
      })

      if (!result.cancelled && result.base64) {
        const vault = AccountManager.getInstance().vault

        const avatar = {
          uri: `data:image/${result.format};base64,` + result.base64,
        }

        await vault.profiles.public.set('avatar', avatar)

        dispatch(
          setPublicProfileByDid({
            did,
            publicProfile: { ...publicProfileData, avatar },
          })
        )
      }
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  return (
    <View style={style.img}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        visible={!loadingState.loading}
        width={120}
        height={120}
        shimmerStyle={[{ borderRadius: 60 }]}>
        <TouchableOpacity style={style.loader} onPress={loadPhoto}>
          <FastImage
            style={style.imgContainer}
            source={image}
            resizeMode={FastImage.resizeMode.cover}
            defaultSource={userImg}
          />
          <PhotoCameraSvg style={style.svg} />
        </TouchableOpacity>
      </ShimmerPlaceHolder>
    </View>
  )
}

const style = StyleSheet.create({
  img: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imgContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  svg: {
    position: 'absolute',
    bottom: 27,
  },
  loader: {
    alignItems: 'center',
  },
})

const mapStateToProps = (state) => {
  return { publicProfileData: selectSelectedPublicProfile(state) }
}

export default connect(mapStateToProps)(ProfileImageLoader)
