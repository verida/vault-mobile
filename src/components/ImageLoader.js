import React, { useCallback, useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import * as ImagePicker from 'expo-image-picker'
import PhotoCameraSvg from '../assets/photo-camera.svg'
import { WHITE_COLOR } from '../constants/color'
import { getVault, loadAvatarSource } from '../api'

const userImg = require('../assets/stubs/avatar.png')

function ImageLoader() {
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
        const vault = await getVault()
        let avatar = await vault.profiles.public.get('avatar')
        console.log('avatar:', avatar)

        if (!avatar) {
          avatar = {
            encoding: 'base64',
            format: 'jpeg',
            base64: '',
          }
        } else {
          avatar = JSON.parse(avatar)
        }

        avatar.base64 = result.base64
        await vault.profiles.public.set('avatar', JSON.stringify(avatar))

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

export default ImageLoader
