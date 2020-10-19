import React from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '../components/Text';
import PropertyList from '../components/PropertyList';
import NavigationHeader from '../components/Navigation/NavigationHeader';

import LayoutStyle from '../styles/layouts';
import { Actions } from 'react-native-router-flux';

import { LOGIN_HISTORY, SEED_PHRASE_VIEW, START, CHANGE_PIN, HOME } from '../constants/route';
import { BLACK_COLOR_OPACITY, ORANGE_COLOR } from '../constants/color';

import { clearWallet } from '../api';
import { NUNITO_SANS_BOLD } from '../constants/text';

export default () => (
    <View>
        <NavigationHeader title="Settings" left={{ icon: 'arrow-back', action: Actions[HOME] }} />
        <View style={LayoutStyle.layout}>
            <Text style={style.title}>Security</Text>
            <View>
                <PropertyList list={list} />
            </View>
        </View>
    </View>
);

const style = StyleSheet.create({
    title: {
        fontSize: 12,
        fontFamily: NUNITO_SANS_BOLD,
        color: BLACK_COLOR_OPACITY(0.6),
        textTransform: 'uppercase',
        marginTop: 24,
        marginBottom: 6
    },
    logoutText: {
        color: ORANGE_COLOR
    }
});

const logout = async () => {
    await clearWallet();
    Actions[START]();
};

const list = [
    { label: 'Change PIN', action: 'arrow', optional: true, onPress: () => Actions[CHANGE_PIN]() },
    { label: 'Seed Phrase', action: 'arrow', optional: true, onPress: () => Actions[SEED_PHRASE_VIEW]() },
    // { label: "Notifications", action: "arrow" },
    { label: 'Login History', action: 'arrow', optional: true, onPress: () => Actions[LOGIN_HISTORY]() },
    { label: 'Log Out', text: style.logoutText, optional: true, onPress: logout }
];
