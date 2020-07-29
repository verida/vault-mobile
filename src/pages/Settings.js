import React from "react";
import {StyleSheet, View} from "react-native";

import Text from "../components/Text";
import PropertyList from "../components/PropertyList";

import LayoutStyle from "../styles/layouts";
import {Actions} from "react-native-router-flux";

import {LOGIN_HISTORY, SEED_PHRASE_VIEW, START} from "../constants/route";
import {BLACK_COLOR_OPACITY, ORANGE_COLOR} from "../constants/color";

import {clearWallet} from "../api";

export default () => (
    <View style={LayoutStyle.layout}>
        <Text style={style.title}>Security</Text>
        <View>
            <PropertyList list={list} />
        </View>
    </View>
)

const style = StyleSheet.create({
    title: {
        fontWeight: "800",
        fontSize: 12,
        color: BLACK_COLOR_OPACITY(0.6),
        textTransform: "uppercase",
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
    { label: "PIN", action: "arrow", optional: true, onPress: () => {} },
    { label: "Face ID", action: "switch", optional: true },
    { label: "Seed Phrase", action: "arrow", optional: true, onPress: () => Actions[SEED_PHRASE_VIEW]() },
    // { label: "Notifications", action: "arrow" },
    { label: "Login History", action: "arrow", optional: true, onPress: () => Actions[LOGIN_HISTORY]() },
    { label: "Log Out", text: style.logoutText, optional: true, onPress: logout }
];
