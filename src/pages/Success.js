import React from 'react'
import {View, StyleSheet} from "react-native";

import Success from "../assets/success.svg";

import Text from "../components/Text";
import Details from "../components/Details";
import Button from "../components/Button";
import Layout from "../components/Layouts/Layout";

import {Actions} from "react-native-router-flux";

import {HOME} from "../constants/route";
import {BLACK_COLOR} from "../constants/color";

export default () => {
    const onDone = () => Actions[HOME]();

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
    )
};

const style = StyleSheet.create ({
    layout: {
        justifyContent: "center",
        minHeight: "100%"
    },
    header: {
        alignItems: "center"
    },
    title: {
        margin: 32,
        fontWeight: "800",
        fontSize: 28,
        color: BLACK_COLOR,
        fontFamily: "Avenir"
    },
    description: {
        fontFamily: "Avenir",
        fontWeight: "500",
        fontSize: 14,
        color: BLACK_COLOR,
        opacity: 0.6
    },
    mt: {
        marginTop: 56
    }
});
