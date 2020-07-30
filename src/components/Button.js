import React from "react";
import { TouchableOpacity } from "react-native";
import ButtonStyles from "../styles/button";
import TextStyles from "../styles/text";
import Text from "./Text";

export default (props) => {
    const styles = props.style || {};
    const type = (props.color && ButtonStyles[props.color]) || ButtonStyles.primary;
    const textColor = (() => {
        switch (props.color) {
            case "secondary":
            case "transparent":
            case "grey":
                return "primary";
            default: return "white";
        }
    })();

    return (
        <TouchableOpacity style={[ButtonStyles.button, styles, type, props.disabled && ButtonStyles.disabled]}
          onPress={props.onPress}
          disabled={props.disabled}>
            <Text style={{...TextStyles[textColor], marginBottom: 4}}>
                {props.children}
            </Text>
        </TouchableOpacity>
    )
}
