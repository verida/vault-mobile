import React, { useState, useEffect } from 'react';
import Details from './Details';

import { getWallet, getVault } from '../../api';

export default () => {
    const [info, setInfo] = useState({});
    const init = async () => {
        const wallet = await getWallet();
        const vault = await getVault();
        const name = await vault.profiles.public.get('name')

        setInfo({
            did: wallet.did,
            name: name
        });
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Details title="Name" text={info.name}/>
            <Details title="DID" text={info.did} />
        </>
    );
};
