import { createStore } from "redux";

import {ADD_WORD, REMOVE_WORD, RESET_PHRASE, SET_MNEMONIC} from "./words/action-types";

const initialState = {
    template: [],
    mnemonic: ""
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_WORD:
            if (state.template.includes(action.payload)) return state;
            const template = [...state.template, action.payload];
            return { ...state, template };
        case REMOVE_WORD:
            const filtered = state.template.filter(item => item !== action.payload);
            return { ...state, template: filtered };
        case RESET_PHRASE:
            return { ...state, template: [] };
        case SET_MNEMONIC:
            return { ...state, mnemonic: action.payload };
        default:
            return state
    }
};

export default createStore(reducer);
