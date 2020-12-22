import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Container, Content } from 'native-base';
import Layout from '../components/Layouts/Layout';
//import Search from '../components/Search'; <Search />
import CardList from '../components/CardList';
import NavigationHeader from '../components/Navigation/NavigationHeader';
import { fetchInboxItems } from '../api';
import { buildItem } from '../helpers/inbox'
import _ from 'lodash';

const Inbox = (props) => {
    const [inbox, setInbox] = useState([]);

    // Initialise component
    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        console.log('fetch inbox items')
        const inboxItems = await fetchInboxItems();
        console.log('received '+inboxItems.length+' items')
        const results = [];
        for (let i=0; i<inboxItems.length; i++) {
            let item = await buildItem(inboxItems[i]);
            results.push(item);
        }

        setInbox(results);
    };

    return (
        <Container>
            <NavigationHeader title="Inbox" />
            <Content>
                <Layout>
                    <CardList list={inbox} />
                </Layout>
            </Content>
        </Container>
    );
}

const mapDispatchToProps = dispatch => {
    return {
        setInboxItems: data => dispatch(setInboxItems(data)),
    };
};

const mapStateToProps = state => {
    return { setInboxItems: state.setInboxItems };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);