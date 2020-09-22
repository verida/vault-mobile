import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { QRCode } from 'react-native-custom-qr-codes-expo';
import Constants from 'expo-constants';

import Text from '../../components/Text';
import HomeTopTabs from '../../components/Navigation/HomeTopTabs';

import Layout from '../../components/Layouts/Layout';

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';
import { BLACK_COLOR_OPACITY, BLACK_ORIGIN_COLOR, WHITE_COLOR } from '../../constants/color';

import { getWalletInfo } from '../../api';

const UserImg = require('../../assets/stubs/user.png');
const LogoImg = require('../../assets/vault-logo.png');

export default () => {
    const [info, setInfo] = useState({});

    useEffect(() => {
        init();
    });

    const init = async () => {
        const data = await getWalletInfo();
        setInfo(data);
    };

    return (
        <Layout style={style.container}>
            <HomeTopTabs />
            <Image
                width={80}
                height={80}
                source={UserImg}
                style={style.userImg} />
            <Text style={style.title}>
                chris_were
            </Text>
            <Text style={style.text}>
                { info.address }
            </Text>
            <View style={style.qr}>
                <QRCode
                    logo={LogoImg}
                    logoSize={60}
                    size={207}
                    codeStyle='dot'
                    innerEyeStyle='circle'
                    padding={0.5}
                    content={info.address} />
            </View>
            <Text style={style.notes}>
                This is your QR-Code. Present it to others so they can scan it and connect to you
            </Text>
        </Layout>
    );
};

const marginTop = (Platform.OS === 'ios' ? Constants.statusBarHeight : 0) + 24;
const style = StyleSheet.create ({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%'
    },
    title: {
        fontSize: 22,
        lineHeight: 30,
        marginTop: 16,
        fontFamily: NUNITO_SANS_BOLD
    },
    userImg: {
        marginTop
    },
    text: {
        height: 50,
        fontSize: 14,
        marginTop: 4,
        marginBottom: 16,
        paddingHorizontal: 43,
        textAlign: 'center',
        color: BLACK_COLOR_OPACITY(0.6),
        fontFamily: NUNITO_SANS_BOLD
    },
    qr: {
        width: 240,
        height: 240,
        borderRadius: 12,
        padding: 17,
        backgroundColor: WHITE_COLOR,

        shadowColor: BLACK_ORIGIN_COLOR,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        elevation: 3
    },
    notes: {
        marginVertical: 24,
        paddingHorizontal: 43,
        textAlign: 'center',
        fontFamily: NUNITO_SANS_SEMIBOLD,
        color: BLACK_COLOR_OPACITY(0.4)
    }
});
