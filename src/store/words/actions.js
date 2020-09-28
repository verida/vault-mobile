import { ADD_WORD, REMOVE_WORD, RESET_PHRASE } from './action-types';

export const addWord = (payload) => {
    return { type: ADD_WORD, payload };
};

export const removeWord = (payload) => {
    return { type: REMOVE_WORD, payload };
};

export const resetPhrase = () => {
    return { type: RESET_PHRASE };
};
