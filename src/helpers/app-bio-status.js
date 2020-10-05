import * as Keychain from 'react-native-keychain';

export const setAppBioAuthStatus = async (status = false) => {
    return Keychain.setInternetCredentials(
        'VeridaBioAuthStatus',
        'VeridaBioAuthStatus',
        JSON.stringify({ status })
    );
};

export const getAppBioAuthStatus = async () => {
    try {
        const result = await Keychain.getInternetCredentials(
            'VeridaBioAuthStatus'
        );
        return result && JSON.parse(result.password);
    } catch (error) {
        console.log('VeridaBioAuthError: ', error);
    }
};
