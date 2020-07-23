import {Actions} from "react-native-router-flux";
import {EDIT_PROFILE} from "../constants/route";

export const editable = (list) => (
    list.map(option => ({
        ...option,
        onPress: () => {Actions[EDIT_PROFILE]({ title: option.label, option })}
    }))
);
