import React, { useState, useEffect } from 'react';
import { Icon } from 'native-base';
import Clipboard from '@react-native-community/clipboard';

import Layout from '../../components/Layouts/Layout';
import WordCard from '../../components/Words/WordCard';
import Button from '../../components/Button';

import { getWalletInfo } from '../../api';

export default () => {
    const [words, setWords] = useState('');

    const init = async () => {
        const { mnemonic } = await getWalletInfo();
        setWords(mnemonic);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <Layout style={{ marginTop: 20 }}>
            <WordCard words={words}/>
            <Button color="transparent-grey" onPress={() => Clipboard.setString(words)} style={{ marginTop: 10 }}>
                {'Copy to clipboard\u00A0'}
                <Icon name="copy" />
            </Button>
        </Layout>
    );
};
