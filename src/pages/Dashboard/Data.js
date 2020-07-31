import React from "react";
import {StyleSheet, Linking, View} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";

import Text from "../../components/Text";
import {BLACK_COLOR_OPACITY, PRIMARY_COLOR} from "../../constants/color";
import {NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD} from "../../constants/text";

const vaultURL = "http://vault.verida.io/";
const openVault = () => Linking.openURL(vaultURL);

export default () => (
    <View style={style.container}>
        <Text style={style.title}>View Data</Text>
        <Text style={style.text}>You can view all your encrypted data by logging into the Verida Vault</Text>
        <TouchableOpacity onPress={openVault}>
            <Text style={style.link}>{vaultURL}</Text>
        </TouchableOpacity>
    </View>
);

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 57,
        paddingVertical: 40
    },
    title: {
        fontFamily: NUNITO_SANS_BOLD,
        fontSize: 22
    },
    text: {
        textAlign: 'center',
        fontFamily: NUNITO_SANS_BOLD,
        color: BLACK_COLOR_OPACITY(0.6),
        fontSize: 14,
        lineHeight: 19,
        marginVertical: 7
    },
    link: {
        color: PRIMARY_COLOR,
        textDecorationLine: 'underline',
        fontFamily: NUNITO_SANS_SEMIBOLD,
        fontSize: 16,
        lineHeight: 22
    }
});
