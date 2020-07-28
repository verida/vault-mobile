import {StyleSheet} from "react-native";
import {LIGHTGREY_COLOR} from "../constants/color";

const input = {
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    borderRadius: 4,
    paddingVertical: 15,
    paddingHorizontal: 16
};

export default StyleSheet.create({
    input,
    select: {
        height: 50,
        alignItems: "flex-start"
    },
    textarea: {
        ...input,
        minHeight: 68,
        paddingTop: 16
    }
});
