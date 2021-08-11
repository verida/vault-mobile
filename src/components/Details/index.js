import React, { useEffect, useState } from 'react';
import Details from './Details';

import { getVault, getWallet } from '../../api';

export default () => {
  const [info, setInfo] = useState({});
  
  
  useEffect(() => {
    const init = async () => {
      const wallet = await getWallet();
      const vault = await getVault();
      const name = await vault.profiles.public.get('name');
      
      setInfo({
        did: wallet.did,
        name: name
      });
    };
    
    init();
  }, []);
  
  return (
    <>
      <Details title="Name" text={info.name}/>
      <Details title="DID" text={info.did} />
    </>
  );
};
