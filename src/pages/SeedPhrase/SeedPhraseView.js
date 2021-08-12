import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Clipboard from '@react-native-community/clipboard';

import Layout from '../../components/Layouts/Layout';
import WordCard from '../../components/Words/WordCard';
import Button from '../../components/Button';
import NavigationHeader from 'components/Navigation/NavigationHeader';

import { getWallet } from '../../api';

export default () => {
  const [words, setWords] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    const init = async () => {
      const wallet = await getWallet();
      setWords(wallet.mnemonic);
      setKey(wallet.privateKey);
    };
    
    init();
  }, []);

  return (
    <View>
      <NavigationHeader title="Seed Phrase" />
      <Layout style={{ marginTop: 20 }}>
        <WordCard words={words}/>
        <Button color="transparent-grey" onPress={() => Clipboard.setString(words)} style={{ marginTop: 10 }}>
          {'Copy seed phrase\u00A0'}
        </Button>

        <WordCard words={key}/>
        <Button color="transparent-grey" onPress={() => Clipboard.setString(key)} style={{ marginTop: 10 }}>
          {'Copy private key\u00A0'}
        </Button>
      </Layout>
    </View>
  );
};
