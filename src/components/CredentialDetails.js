import React from "react";
import {StyleSheet, View} from "react-native";

import Text from "./Text";
import Label from "./Label";

const info = [

];

const details = info.map(item =>
    <View>
        <Label>{ item.title }:</Label>
        <Text>{ item.value }</Text>
    </View>
);

export default () => (
    <View>
        <Text style={style.title}>Test Details</Text>
        { details }
    </View>
)

const style = StyleSheet.create({
    title: {
        fontSize: 18,
        fontFamily: "AvenirBold",
        marginBottom: 13
    }
});
