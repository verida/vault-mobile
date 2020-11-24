import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Container, Content } from 'native-base';
import Layout from '../components/Layouts/Layout';
//import Search from '../components/Search'; <Search />
import CardList from '../components/CardList';
import NavigationHeader from '../components/Navigation/NavigationHeader';
import { fetchInboxItems } from '../api';
import _ from 'lodash';
import moment from 'moment';

/*const inboxList = [
    {
        id: 1,
        logo: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
        title: 'IBM HR',
        from: '',
        createdAt: 'May 25',
        type: 1,
        read: false
    },
    {
        id: 2,
        logo: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
        title: 'Steve Smith',
        from: 'Verida Health: ERM',
        createdAt: 'May 25',
        type: 2,
        read: false
    },
    {
        id: 3,
        logo: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
        title: 'Steve Smith',
        from: 'Verida Health: ERM',
        createdAt: 'May 25',
        type: 3,
        read: false
    }
];*/

const Inbox = (props) => {
    const [inbox, setInbox] = useState([]);

    // Initialise component
    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        const inboxItems = await fetchInboxItems();
        const results = [];
        for (let i=0; i<inboxItems.length; i++) {
            let item = await buildItem(inboxItems[i]);
            results.push(item);
        }

        setInbox(results);
    };

    const buildItem = async (inboxItem) => {
        const item = {
            id: inboxItem._id,
            logo: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
            title: inboxItem.message,
            createdAt: moment(inboxItem.sentAt).format('MMM DD'),
            type: inboxItem.type,
            read: inboxItem.read,
            item: inboxItem
        };

        const profile = await getProfile(inboxItem.sentBy)
        const name = profile('name', '')
        item.from = name ? `Sent by ${name} ` : ''
        item.from += `via ${inboxItem.sentBy.app}`

        return item;
    }

    // @todo: Add to vault
    const getProfile = async (sentBy) => {
        try {
            const profile = await global.Verida.openProfile(sentBy.did, sentBy.appName)
            const profileItems = await profile.getMany()

            return (key, stub) => {
                const data = _.find(profileItems, data => data.key === key)
                return (data && data.value) || stub
            }
        } catch (err) {
            console.log("no profile");
            // User may not have created a profile
            return (key, stub) => {
                return ''
            }
        }
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