import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import PhotoCameraSvg from '../assets/photo-camera.svg';
import { WHITE_COLOR } from '../constants/color';

//const userImg = 'https://developers.google.com/web/tools/chrome-user-experience-report/images/logo.png?hl=ru-RU';
const userImg = require('../assets/stubs/avatar.png');
import { getVault, loadAvatarSource } from '../api';

//source={{uri: 'data:image/jpeg;base64,' + image.base64}}

export default () => {
    const [image, setImage] = useState(userImg);
    //const [granted, setGranted] = useState(null);

    useEffect(() => {
        const loadAvatar = async () => {
            const avatarSource = await loadAvatarSource()
            setImage(avatarSource)
        }
        
        loadAvatar();
    }, []);

   

    const loadPhoto = async () => {
        // if (!granted) {
        //     const {status} = await ImagePicker.requestCameraRollPermissionsAsync();
        //     setGranted(status);
        //     if (status !== 'granted') {
        //         alert('Sorry, we need camera roll permissions to make this work!');
        //         return;
        //     }
        // }
        console.log({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0,
            base64: true
        })

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.1,
            base64: true
        });

        if (!result.base64) {
            //console.log('no base64!')
            console.log(result)
        } else {
            //console.log('base64 with length: ',result.base64.length)
            console.log(result.type, result.width, result.height, result.uri)
        }

        

        if (!result.cancelled && result.base64) {
            const vault = await getVault()
            let avatar = await vault.profiles.public.get('avatar')
            avatar = JSON.parse(avatar)

            if (!avatar) {
                console.log('no avatar!')
                avatar = {
                    encoding: 'base64',
                    format: 'jpeg',
                    base64: ''
                }
            }

            avatar.base64 = result.base64
            let resp = await vault.profiles.public.set('avatar', JSON.stringify(avatar))

            loadAvatar()
        }
    };

    return (
        <View style={style.img}>
            <TouchableOpacity style={style.loader} onPress={loadPhoto}>
                <Image source={image} style={style.imgContainer} />
                <PhotoCameraSvg style={style.svg} />
            </TouchableOpacity>
        </View>
    );
};

const style = StyleSheet.create({
    img: {
        alignItems: 'center',
        marginBottom: 24
    },
    imgContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: WHITE_COLOR,
        borderWidth: 4
    },
    svg: {
        position: 'absolute',
        bottom: 27,
    },
    loader: {
        alignItems: 'center'
    }
});
