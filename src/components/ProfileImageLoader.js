import * as Sentry from '@sentry/react-native'
import * as ImagePicker from 'expo-image-picker'
import {
  selectPublicProfile,
  setPublicProfileData as setPublicProfileDataAction,
} from 'features/profiles'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { connect } from 'react-redux'

import AccountManager from 'api/AccountManager'
import { loadAvatarSource } from 'api/utils'

import PhotoCameraSvg from '../assets/photo-camera.svg'

const userImg = require('assets/stubs/avatar.png')

function ProfileImageLoader(props) {
  const { publicProfileData, setPublicProfileData } = props
  const [image, setImage] = useState(userImg)
  //const [granted, setGranted] = useState(null);

  const loadAvatar = useCallback(async () => {
    const avatarSource = await loadAvatarSource()
    setImage(avatarSource)
  }, [])

  useEffect(() => {
    loadAvatar()
  }, [loadAvatar])

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

        setPublicProfileData({ ...publicProfileData, avatar })

        loadAvatar()
      }
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  return (
    <View style={style.img}>
      <TouchableOpacity style={style.loader} onPress={loadPhoto}>
        <FastImage
          style={style.imgContainer}
          source={image}
          resizeMode={FastImage.resizeMode.cover}
        />
        <PhotoCameraSvg style={style.svg} />
      </TouchableOpacity>
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
  return { publicProfileData: selectPublicProfile(state) }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setPublicProfileData: (data) => dispatch(setPublicProfileDataAction(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileImageLoader)
