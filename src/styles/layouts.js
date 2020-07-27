import {StyleSheet, Dimensions} from "react-native";
import {LIGHTGREY_COLOR} from "../constants/color";

export default StyleSheet.create({
    layout: {
        backgroundColor: LIGHTGREY_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 23,
        minHeight: Dimensions.get('window').height,
    }
});
