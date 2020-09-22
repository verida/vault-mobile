import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import PhotoCameraSvg from '../assets/photo-camera.svg';
import { WHITE_COLOR } from '../constants/color';

const userImg = 'https://developers.google.com/web/tools/chrome-user-experience-report/images/logo.png?hl=ru-RU';

export default () => {
    const [image, setImage] = useState(userImg);
    const [granted, setGranted] = useState(null);

    const loadPhoto = async () => {
        // if (!granted) {
        //     const {status} = await ImagePicker.requestCameraRollPermissionsAsync();
        //     setGranted(status);
        //     if (status !== 'granted') {
        //         alert('Sorry, we need camera roll permissions to make this work!');
        //         return;
        //     }
        // }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    return (
        <View style={style.img}>
            <Image source={{ uri: image }} style={style.imgContainer}/>
            <TouchableOpacity onPress={loadPhoto} style={style.loader}>
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
