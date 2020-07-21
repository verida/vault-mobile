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
                    { item.value && <Text style={[style.text, style.value]}>{ item.value }</Text>}
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
        fontSize: 17
    },
    section: {
        flexDirection: "row"
    },
    icon: {
        marginRight: 18
    },
    alignRight: {
        justifyContent: "flex-end"
    },
    value: {
        marginRight: 25,
        color: "#041133",
        opacity: 0.6
    }
});
