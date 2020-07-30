import React from "react";
import {View, StyleSheet} from "react-native";

import Layout from "../components/Layouts/Layout";
import CredentialCard from "../components/CredentialList/CredentialCard";
import CredentialDetails from "../components/CredentialDetails";

import StyleDivider from "../styles/divider";
import { QRCode } from "react-native-custom-qr-codes-expo";
import {BLACK_ORIGIN_COLOR, WHITE_COLOR} from "../constants/color";

export default ({ credential }) => (
    <Layout>
        <View style={style.qr}>
            <QRCode
                size={160}
                content={"react-native-custom"} />
        </View>
        <CredentialCard
            item={credential}
            style={{marginTop: 24, marginBottom: 24}}
            active={false}
            />
        <View style={StyleDivider.divider} />
        <CredentialDetails />
    </Layout>
)

const style = StyleSheet.create({
    qr: {
        padding: 20,
        borderRadius: 17,
        alignItems: "center",
        marginTop: 24,
        alignSelf: "center",
        shadowOpacity: 0.1,
        shadowOffset: {
          width: 0,
          height: 0
        },
        backgroundColor: WHITE_COLOR,
        elevation: 3
    }
});
