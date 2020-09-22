import { Actions } from 'react-native-router-flux';
import { EDIT_PROFILE } from '../constants/route';

const edit = (option) => {Actions[EDIT_PROFILE]({ title: option.label, option });};

export const editable = (list) => (
    list.map(option => ({
        ...option,
        onPress: () => option.onPress ? option.onPress(option) : edit(option)
    }))
);
