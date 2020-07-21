import React from 'react';
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "../../assets/logo.svg";
import Texture from "../../assets/landing-bg.svg";
import {Actions} from "react-native-router-flux";

import Button from "../../components/Button";

import {
    CREATE_ACCOUNT,
    IMPORT_ACCOUNT
} from "../../constants/route";

export default () => {
    const title = `Welcome!\nIt's time to own your personal data.`;

    const createAcc = () => (Actions[CREATE_ACCOUNT]());
    const importAcc = () => (Actions[IMPORT_ACCOUNT]());

    return (
        <LinearGradient
            colors={['#0E1572', '#1467CB', '#1995CB']}
            style={style.landing}>
            <Texture
                width={425}
                height={428} />
            <View style={style.positionAbsolute}>
                <Logo
                    width={139}
                    height={51} />
                <Text style={style.title}>
                    {title}
                </Text>
                <View style={style.footer}>
                    <Button color="secondary" onPress={createAcc}>
                        Create An Account
                    </Button>
                    <Button color="outlined" onPress={importAcc}>
                        Import An Account
                    </Button>
                </View>
            </View>
        </LinearGradient>
    )
};

const style = StyleSheet.create ({
    positionAbsolute: {
        position: 'absolute',
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 77,
        height: '100%'
    },
    texture: {
        position: 'absolute',
        left: -85,
        top: -98,
    },
    landing: {
        flex: 1,
    },
    title: {
        color: 'white',
        fontFamily: 'Avenir',
        fontWeight: '800',
        fontSize: 36,
        marginTop: '35%'
    },
    logo: {
        width: 150,
        height: 150,
    },
    footer: {
        position: 'absolute',
        paddingVertical: 77,
        flex: 1,
        left: 24,
        right: 0,
        bottom: 0
    }
});
