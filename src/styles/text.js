import {StyleSheet} from "react-native";
import {BLACK_COLOR, BLACK_COLOR_OPACITY, WHITE_COLOR} from "../constants/color";

const sharedProps = {
    fontFamily: 'NunitoSansBold',
    fontWeight: '500',
    fontSize: 16,
    alignItems: "center",
    textAlign: "center",
};

export default StyleSheet.create ({
    primary: {
        color: BLACK_COLOR,
        ...sharedProps
    },
    white: {
        color: WHITE_COLOR,
        ...sharedProps
    },
    grey: {
        color: BLACK_COLOR,
        opacity: 0.6,
        ...sharedProps
    },
    darkgrey: {
        color: BLACK_COLOR_OPACITY(0.8),
        ...sharedProps,
    }
});
