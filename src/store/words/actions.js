import { ADD_WORD, REMOVE_WORD, RESET_PHRASE, SET_MNEMONIC } from './action-types';

export const addWord = (payload) => {
    return { type: ADD_WORD, payload };
};

export const setMnemonic = (payload) => {
    return { type: SET_MNEMONIC, payload };
};

export const removeWord = (payload) => {
    return { type: REMOVE_WORD, payload };
};

export const resetPhrase = () => {
    return { type: RESET_PHRASE };
};
