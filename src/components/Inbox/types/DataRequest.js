import React from 'react';
import { Content } from 'native-base';

import RequestDetailsLayout from '../RequestDetailsLayout';
import { getVault } from '../../../api';

export default ({ item, inboxItem, type }) => {
    const onResultClick = async (result) => {
        const vault = await getVault();
        await vault.inbox.handleAction(inboxItem, result, {});
    }

    return (
        <Content>
            <RequestDetailsLayout item={item} type={type} inboxItem={inboxItem} onResultClick={onResultClick} />
        </Content>
    );
};
