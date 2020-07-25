import React from "react";
import {View, StyleSheet} from "react-native";
import Layout from "../../components/Layouts/Layout";
import Button from "../../components/Button";
import Text from "../Text";
import Description from "./Description";

export default ({ company, children }) => {
    return (
        <Layout style={style.layout}>
            <View>
                <Text style={style.title}>Employment Reference</Text>
                <Description details={company} />
                    { children }
            </View>
            <View style={style.action}>
                <Button style={{...style.btn, marginRight: 20}}>Accept</Button>
                <Button color="grey" style={style.btn}>Decline</Button>
            </View>
        </Layout>
    );
}

const style = StyleSheet.create({
    title: {
        fontSize: 22,
        lineHeight: 41,
        fontFamily: "AvenirBold",
        marginTop: 24
    },
    layout: {
        justifyContent: "space-between",
        flex: 1
    },
    action: {
        flexDirection: "row",
        marginBottom: 30,
    },
    btn: {
        flex: 0.5,
        height: 40
    }
});
