import React from 'react';
import { Content } from 'native-base';
import { Actions } from 'react-native-router-flux';

import RequestDetailsLayout from '../RequestDetailsLayout';
import { getVault } from '../../../api';

export default ({ item, inboxItem, type }) => {
    const onResultClick = async (result) => {
        console.log('b')
        const vault = await getVault();
        await vault.inbox.handleAction(inboxItem, result, {});
        Actions.pop()
    }

    return (
        <Content>
            <RequestDetailsLayout item={item} type={type} inboxItem={inboxItem} onResultClick={onResultClick}>
                {/* Hide details about incoming data for now. <RecordList list={records} /> */}
            </RequestDetailsLayout>
        </Content>
    );
};
