import { createStore } from 'redux';

import { ADD_WORD, REMOVE_WORD, RESET_PHRASE } from './words/action-types';
import { SET_AUTH_STATUS, SET_BIO_AUTH_STATUS, SET_PUBLIC_PROFILE_DATA } from './general/action-types';

const initialState = {
    template: [],
    authenticated: false,
    bioAuthStatus: false,
    publicProfileData: {
        name: '',
        country: '',
        description: ''
    },
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
    case SET_AUTH_STATUS:
        return { ...state, authenticated: action.payload };
    case SET_BIO_AUTH_STATUS:
        return { ...state, bioAuthStatus: action.payload };
    case SET_PUBLIC_PROFILE_DATA:
        return { ...state, publicProfileData: action.payload };
    default:
        return state;
    }
};

export default createStore(reducer);
