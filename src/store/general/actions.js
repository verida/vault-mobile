import { SET_AUTH_STATUS, SET_BIO_AUTH_STATUS, SET_PUBLIC_PROFILE_DATA, SET_NEW_MESSAGES_COUNT, SET_INBOX_ITEMS } from './action-types';

export const setAuthStatus = (payload) => {
    return { type: SET_AUTH_STATUS, payload };
};

export const setBioAuthStatus = (payload) => {
    return { type: SET_BIO_AUTH_STATUS, payload };
};

export const setPublicProfileData = (payload) => {
    return { type: SET_PUBLIC_PROFILE_DATA, payload };
};

export const setNewMessagesCount = (payload) => {
    return { type: SET_NEW_MESSAGES_COUNT, payload };
};

export const setInboxItems = (payload) => {
    return { type: SET_INBOX_ITEMS, payload };
}