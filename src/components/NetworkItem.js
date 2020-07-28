import React from "react";
import {StyleSheet, View} from "react-native";
import {LIGHTGREY_COLOR, SUCCESS_COLOR} from "../constants/color";
import Text from "./Text";
import { CheckBox } from "react-native-elements";

export default ({ network, selected, onSelect }) => {
    return (
        <View style={style.container}>
            <View style={style.description}>
                { network.logo }
                <Text style={style.title}>{ network.title }</Text>
            </View>
            <CheckBox
                containerStyle={style.checkbox}
                iconType='material'
                checkedIcon='check-circle'
                uncheckedIcon='radio-button-unchecked'
                checkedColor={SUCCESS_COLOR}
                uncheckedColor={LIGHTGREY_COLOR}
                size={20}
                checked={selected}
                onPress={() => onSelect(network.id)}
            />
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        borderRadius: 4,
        borderWidth: 1,
        borderColor: LIGHTGREY_COLOR,
        paddingHorizontal: 15,
        paddingVertical: 9,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 16
    },
    description: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        marginLeft: 12,
        paddingTop: 4
    },
    checkbox: {
        padding: 0
    }
});
