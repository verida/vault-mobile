import React, { useState } from "react";
import {StyleSheet, TouchableOpacity, View, Switch} from "react-native";

import Text from "../Text";
import Icon from "react-native-vector-icons/MaterialIcons";
import {BLACK_COLOR_OPACITY, SUCCESS_COLOR} from "../../constants/color";

export default ({ styles, item }) => {
    const [option, setOption] = useState(false);

    return (
        <TouchableOpacity style={styles.external} onPress={item.onPress}>
            <View style={styles.internal}>
                <View style={style.section}>
                    { item.icon && <View style={style.icon}>{ item.icon }</View> }
                    <Text style={[style.text, styles.text]}>{item.label}</Text>
                </View>
                <View style={[style.section, style.alignRight]}>
                    { !item.optional &&
                        <Text
                            numberOfLines={1}
                            ellipsizeMode='tail'
                            style={[style.text, style.value]}>
                            { item.value || "Not set" }
                        </Text> }
                    { item.custom }
                    <View style={{marginRight: 16}}>
                        {item.action === "arrow" &&
                        <Icon
                            size={22}
                            name="keyboard-arrow-right"
                            color={BLACK_COLOR_OPACITY(0.45)} />
                        }
                        { item.action === "switch" &&
                        <Switch
                            trackColor={{ false: "#767577", true: SUCCESS_COLOR }}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setOption}
                            value={option} />
                        }
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const style = StyleSheet.create({
    text: {
        fontWeight: "500",
        fontSize: 17,
        height: 20,
        maxWidth: 120
    },
    section: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 18
    },
    alignRight: {
        justifyContent: "flex-end"
    },
    value: {
        marginRight: 25,
        color: BLACK_COLOR_OPACITY(0.6)
    }
});
