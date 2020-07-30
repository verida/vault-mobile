import {StyleSheet} from "react-native";
import {LIGHTGREY_COLOR, PRIMARY_COLOR, WHITE_COLOR} from "../constants/color";

export default StyleSheet.create({
    button: {
        borderRadius: 4,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        height: 48,
        justifyContent: "center"
    },
    outlined: {
        backgroundColor: 'transparent',
        borderColor: WHITE_COLOR
    },
    primary: {
        backgroundColor: PRIMARY_COLOR,
        borderColor: PRIMARY_COLOR
    },
    secondary: {
        backgroundColor: WHITE_COLOR,
        borderColor: WHITE_COLOR
    },
    transparent: {
        backgroundColor: 'transparent',
        borderColor: 'transparent'
    },
    grey: {
        borderColor: LIGHTGREY_COLOR
    },
    disabled: {
        opacity: 0.5
    }
});
