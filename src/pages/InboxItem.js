import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Container, Content } from 'native-base';

import TypeDataSend from '../components/Inbox/TypeDataSend.js';
import NavigationHeader from '../components/Navigation/NavigationHeader';
import { fetchInbox } from '../api';
import { findTypeById } from '../helpers/inbox';

const inboxItemComponents = {
    'inbox/type/dataSend': TypeDataSend
}

const InboxItem = ({ inboxItemId }) => {
    const [inboxItem, setInboxItem] = useState(null);
    const [inboxType, setInboxType] = useState(null);

    // Initialise component
    useEffect(() => {
        setInboxType(findTypeById('inbox/type/dataSend'));
        init();
    }, []);

    const init = async() => {
        const inbox = await fetchInbox();
        const inboxItem = await inbox.getOne({_id: inboxItemId});
        const inboxType = findTypeById(inboxItem.type);
        
        setInboxItem(inboxItem);
        setInboxType(inboxType);
    }

    return (
        <Container>
            <NavigationHeader title="Inbox Message" />
            <Content>
                {inboxItem ?
                    React.createElement(inboxItemComponents[inboxItem.type], {item: inboxItem, type: inboxType})
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