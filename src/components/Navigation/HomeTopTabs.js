import React from "react";
import {View, StyleSheet, TouchableOpacity, Dimensions} from "react-native";

import EnvelopeSvg from "../../assets/icons/envelope.svg";
import SettingsSvg from "../../assets/icons/settings.svg";
import {Actions} from "react-native-router-flux";

import {INBOX, SETTINGS} from "../../constants/route";

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

const style = StyleSheet.create({
    navigation: {
        position: "absolute",
        left: 0,
        top: 56,
        paddingHorizontal: 18,
        width: Dimensions.get('window').width,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    }
});
