import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import * as LocalAuthentication from 'expo-local-authentication';

import Logo from '../../assets/logo.svg';

import { HOME, CHECK_PIN } from '../../constants/route';
import { setBioAuthStatus, setAuthStatus } from '../../store/general/actions';
import { LinearGradient } from 'expo-linear-gradient';

const Authenticate = (props) => {
    const init = async () => {
        if (props.authenticated) return Actions[HOME]();
        const hasSavedBio = await LocalAuthentication.isEnrolledAsync();
        props.setBioAuthStatus(hasSavedBio);

        if (!hasSavedBio) {
            return Actions[CHECK_PIN]({
                subtitle: 'to enter the app',
                finishProcess: () => (props.setAuthStatus(true), Actions[HOME]())
            });
        }

        const { success } = await LocalAuthentication.authenticateAsync();

        if (!success) {
            return Actions[CHECK_PIN]({
                subtitle: 'to enter the app',
                finishProcess: () => (props.setAuthStatus(true), Actions[HOME]())
            });
        }

        props.setAuthStatus(true);
        return Actions[HOME]();
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <LinearGradient
            colors={['#0E1572', '#1467CB', '#1995CB']}
            style={styles.container}>
            <Text>Please, wait for authentication complete!</Text>
            <View style={styles.content}>
                <Logo />
                <ActivityIndicator size="large" color="#fff" />
            </View>
        </LinearGradient>
    );
};

const mapStateToProps = state => {
    return { authenticated: state.authenticated };
};

const mapDispatchToProps = dispatch => {
    return {
        setBioAuthStatus: status => dispatch(setBioAuthStatus(status)),
        setAuthStatus: status => dispatch(setAuthStatus(status))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Authenticate);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center'
    },
    content: {
        paddingTop: 30,
    },
});
