import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';

import EnvelopeSvg from '../../assets/icons/envelope.svg';
import SettingsSvg from '../../assets/icons/settings.svg';
import { Actions } from 'react-native-router-flux';

import { INBOX, SETTINGS } from '../../constants/route';
import Constants from 'expo-constants';

export default () => {
    return (
        <View style={style.navigation}>
            <TouchableOpacity onPress={() => Actions[INBOX]()}>
                <EnvelopeSvg/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Actions[SETTINGS]()}>
                <SettingsSvg/>
            </TouchableOpacity>
        </View>
    );
};

const top = (Platform.OS === 'ios' ? Constants.statusBarHeight : 0) + 10;
const style = StyleSheet.create({
    navigation: {
        top,
        position: 'absolute',
        left: 0,
        paddingVertical: 5,
        paddingHorizontal: 18,
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});
