import React, { useState, useEffect } from 'react';
import Details from './Details';

import { getWallet } from '../../api';

export default () => {
    const [info, setInfo] = useState({});
    const init = async () => {
        const data = await getWallet();
        setInfo(data);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Details title="Username" text="chris_were"/>
            <Details title="DID" text={info.address} />
        </>
    );
};
