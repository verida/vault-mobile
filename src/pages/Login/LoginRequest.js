import React from 'react';
import { View, StyleSheet } from 'react-native';

import VaultLogoInv from '../../assets/vault-logo-inv.svg';
import MobileSvg from '../../assets/mobile.svg';

import Text from '../../components/Text';
import Button from '../../components/Button';
import { Actions } from 'react-native-router-flux';
import { LOGIN_HISTORY } from '../../constants/route';

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';

const approve = () => {
    Actions[LOGIN_HISTORY]();
};

const deny = () => {
    Actions[LOGIN_HISTORY]();
};

export default () => (
    <View style={style.container}>
        <VaultLogoInv />
        <MobileSvg style={style.img} />
        <Text style={style.title}>You have a new request</Text>
        <Text style={style.text}>
            There is a new login approval request from http://vault.verida.io/
        </Text>
        <Text style={style.text}>
            25 May, 2020 at 2:53 pm
        </Text>

        <View style={style.actions}>
            <Button style={[style.btn, style.mr]} onPress={approve}>Approve</Button>
            <Button style={style.btn} color="grey" onPress={deny}>Deny</Button>
        </View>
    </View>
);

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 55,
        marginHorizontal: 20
    },
    img: {
        marginTop: 51,
        marginBottom: 20
    },
    title: {
        fontFamily: NUNITO_SANS_BOLD,
        fontSize: 22,
        marginVertical: 4,
        textAlign: 'center'
    },
    text: {
        fontFamily: NUNITO_SANS_SEMIBOLD,
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 8
    },
    actions: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
    },
    btn: {
        flex: 1,
        height: 40
    },
    mr: {
        marginRight: 20
    }
});
