import React from "react";
import {StyleSheet, View} from "react-native";

import Text from "./Text";
import Label from "./Label";

import { BLACK_COLOR_OPACITY } from "../constants/color";

const info = [
    {
        title: "Name",
        value: "Robert Brown"
    },
    {
        title: "Date of birth",
        value: "03/03/86"
    },
    {
        title: "Test type",
        value: "COVID-19 PCR"
    },
    {
        title: "Test result",
        value: "Negative"
    },
    {
        title: "Issued by",
        value: "SA Pathology, Adelaide City"
    }
];

export default () => {
    const details = info.map(item =>
        <View key={item.title}>
            <Label style={style.label}>{item.title}:</Label>
            <Text>{ item.value }</Text>
        </View>
    );

    return (
        <View style={style.container}>
            <Text style={style.title}>Test Details</Text>
            { details }
        </View>
    );
}

const style = StyleSheet.create({
    container: {
      marginBottom: 24
    },
    title: {
        fontSize: 18,
        fontFamily: "AvenirBold"
    },
    label: {
        color: BLACK_COLOR_OPACITY(0.6),
        marginLeft: -2
    }
});
