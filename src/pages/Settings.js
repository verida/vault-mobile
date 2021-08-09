import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'native-base';

import Text from '../components/Text';
import PropertyList from '../components/PropertyList';
import NavigationHeader from 'components/Navigation/NavigationHeader';

import LayoutStyle from '../styles/layouts';

import { LOGIN_HISTORY, SEED_PHRASE_VIEW, START, CHANGE_PIN, DASHBOARD } from '../constants/route';
import { BLACK_COLOR_OPACITY, ORANGE_COLOR } from '../constants/color';

import { clearWallet } from '../api';
import { NUNITO_SANS_BOLD } from '../constants/text';

export default () => (
    <View>
        <NavigationHeader
            title="Settings"
            left={{
                icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
                action: () => {}
            }}
        />
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
    // Actions[START]();
};

const list = [
    { label: 'Change PIN', action: 'arrow', optional: true, onPress: () => {} },
    { label: 'Seed Phrase', action: 'arrow', optional: true, onPress: () => {} },
    // { label: "Notifications", action: "arrow" },
    { label: 'Login History', action: 'arrow', optional: true, onPress: () => {} },
    { label: 'Log Out', text: style.logoutText, optional: true, onPress: logout }
];
