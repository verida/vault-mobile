import { Actions } from 'react-native-router-flux';
import { CREATE_PIN } from '../constants/route';

export const onRemind = async () => {
    Actions[CREATE_PIN]();
};
