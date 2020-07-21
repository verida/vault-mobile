import React, {useEffect, useState} from "react";
import { View, StyleSheet, Image } from "react-native";
import { QRCode } from 'react-native-custom-qr-codes-expo';

import Text from "../../components/Text";
import HomeTopTabs from "../../components/Navigation/HomeTopTabs";

import { getWalletInfo } from "../../api";
import {BLACK_ORIGIN_COLOR, WHITE_COLOR} from "../../constants/color";

const UserImg = require("../../assets/stubs/user.png");
const LogoImg = require("../../assets/vault-logo.png");

export default () => {
    const [info, setInfo] = useState({});
    const init = async () => {
        const data = await getWalletInfo();
        setInfo(data);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <View style={style.container}>
            <HomeTopTabs />
            <Image
                width={80}
                height={80}
                source={UserImg}
                style={style.userImg} />
            <Text style={[style.title, {marginTop: 16}]}>
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
        </View>
    )
};

const style = StyleSheet.create ({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    userImg: {
        marginTop: 104
    },
    title: {
        fontWeight: '800',
        fontSize: 22,
        lineHeight: 30
    },
    text: {
        fontWeight: '800',
        fontSize: 14,
        opacity: 0.6,
        marginTop: 4,
        marginBottom: 32,
        maxWidth: 260,
        textAlign: "center"
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
        paddingVertical: 24,
        paddingHorizontal: 43,
        textAlign: 'center',
        opacity: 0.4
    }
});
