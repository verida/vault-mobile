import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Container, Content } from 'native-base';
import NavigationHeader from 'components/Navigation/NavigationHeader';
import { getVault } from '../api';
import { findTypeById, buildItem } from '../helpers/inbox';

import TypeDataSend from '../components/Inbox/types/DataSend';
import TypeDataRequest from '../components/Inbox/types/DataRequest';
import TypeDatastoreSync from '../components/Inbox/types/DatastoreSync';
import TypeDatabaseSync from '../components/Inbox/types/DatabaseSync';

const inboxItemComponents = {
    'inbox/type/dataSend': TypeDataSend,
    'inbox/type/dataRequest': TypeDataRequest,
    'inbox/type/datastoreSync': TypeDatastoreSync,
    'inbox/type/databaseSync': TypeDatabaseSync
}

const InboxItem = ({ inboxItemId }) => {
    const [item, setItem] = useState(null);
    const [inboxItem, setInboxItem] = useState(null);
    const [inboxType, setInboxType] = useState(null);

    // Initialise component
    useEffect(() => {
        setInboxType(findTypeById('inbox/type/dataSend'));
        init();
    }, []);

    const init = async() => {
        const vault = await getVault();
        const inboxItems = await vault.inbox.fetchLatest({_id: inboxItemId});
        const inboxItem = inboxItems[0];
        const item = await buildItem(inboxItem);
        const inboxType = findTypeById(item.type);
        
        setItem(item);
        setInboxItem(inboxItem);
        setInboxType(inboxType);
    }

    return (
        <Container>
            <NavigationHeader title="Inbox Message" />
            <Content>
                {inboxItem ?
                    React.createElement(inboxItemComponents[inboxItem.type], {item, type: inboxType, inboxItem })
                    : null
                }
            </Content>
        </Container>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        setInboxItem: data => dispatch(setInboxItem(data)),
        setInboxType: data => dispatch(setInboxType(data)),
    };
};

const mapStateToProps = state => {
    return { setInboxItem: state.setInboxItem, setInboxType: state.setInboxType };
};

export default connect(mapStateToProps, mapDispatchToProps)(InboxItem);
