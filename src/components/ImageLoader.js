import React, { useCallback, useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import * as ImagePicker from 'expo-image-picker'
import PhotoCameraSvg from '../assets/photo-camera.svg'
import { WHITE_COLOR } from '../constants/color'
import { loadAvatarSource } from 'api/utils'
import AccountManager from 'api/AccountManager'
import { connect } from 'react-redux'
import { setPublicProfileData as setPublicProfileDataAction } from 'reduxStore/general/actions'

const userImg = require('../assets/stubs/avatar.png')

function ImageLoader(props) {
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
      console.log(error)
    }
  }

  return (
    <View style={style.img}>
      <TouchableOpacity style={style.loader} onPress={loadPhoto}>
        <Image source={image} style={style.imgContainer} />
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
    borderColor: WHITE_COLOR,
    borderWidth: 4,
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
  return { publicProfileData: state.publicProfileData }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setPublicProfileData: (data) => dispatch(setPublicProfileDataAction(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ImageLoader)
