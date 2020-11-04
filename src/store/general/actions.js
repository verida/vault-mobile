import { SET_AUTH_STATUS, SET_BIO_AUTH_STATUS } from './action-types';

export const setAuthStatus = (payload) => {
    return { type: SET_AUTH_STATUS, payload };
};

export const setBioAuthStatus = (payload) => {
    return { type: SET_BIO_AUTH_STATUS, payload };
};
