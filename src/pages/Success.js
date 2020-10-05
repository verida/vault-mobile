import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import Success from '../assets/success.svg';

import Text from '../components/Text';
import Details from '../components/Details';
import Button from '../components/Button';
import Layout from '../components/Layouts/Layout';

import { Actions } from 'react-native-router-flux';

import { HOME } from '../constants/route';
import { BLACK_COLOR } from '../constants/color';
import { NUNITO_SANS_BOLD } from '../constants/text';

import { setAppBioAuthStatus } from '../helpers/app-bio-status';

const SuccessPage = () => {
    const [loading, setLoading] = useState(true);

    useEffect(async () => {
        const hasSavedBio = await LocalAuthentication.isEnrolledAsync();
        await setAppBioAuthStatus(hasSavedBio);
        setLoading(false);
    }, []);

    const onDone = () => {
        return Actions[HOME]();
    };

    if (loading) {
        return (
            <View style={style.loadingContent}>
                <Text>Loading </Text>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Layout style={style.layout}>
            <View style={style.header}>
                <Success/>
                <Text style={style.title}>Success!</Text>
            </View>
            <Text style={style.description}>
                A new Ethereum Wallet has been created and linked to your username
            </Text>
            <Details/>
            <Button style={style.mt} color="primary" onPress={onDone}>
                Done
            </Button>
        </Layout>
    );
};

export default SuccessPage;

const style = StyleSheet.create ({
    loadingContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center'
    },
    layout: {
        justifyContent: 'center',
        minHeight: '100%'
    },
    header: {
        alignItems: 'center'
    },
    title: {
        margin: 32,
        fontSize: 28,
        color: BLACK_COLOR,
        fontFamily: NUNITO_SANS_BOLD
    },
    description: {
        fontFamily: 'NunitoSans',
        fontWeight: '500',
        fontSize: 14,
        color: BLACK_COLOR,
        opacity: 0.6
    },
    mt: {
        marginTop: 56
    }
});
