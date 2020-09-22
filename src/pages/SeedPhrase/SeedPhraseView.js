import React, { useState, useEffect } from 'react';

import Layout from '../../components/Layouts/Layout';
import WordCard from '../../components/Words/WordCard';

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
        </Layout>
    );
};
