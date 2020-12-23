import React from 'react';
import { Container, Content } from 'native-base';

import DataCardView from '../../components/Data/CardView';
import DataListView from '../../components/Data/ListView';

import NavigationHeader from '../../components/Navigation/NavigationHeader';

export default Folder = ({ folder }) => {
    //const { navigation, folders } = vault.data.map
    console.log("have folder", folder)

    // Initialise component
    /*useEffect(() => {
        setInboxType(findTypeById('inbox/type/dataSend'));
        init();
    }, []);

    const init = async() => {
        console.log('fetch inbox')
        const inbox = await fetchInbox();
        const inboxItem = await inbox.getOne({_id: inboxItemId});
        const item = await buildItem(inboxItem);
        const inboxType = findTypeById(inboxItem.type);
        
        setInboxItem(item);
        setInboxType(inboxType);
    }*/

    return (
        <Container>
            <NavigationHeader title={ folder.titlePlural || folder.title } />
            <Content>
                {folder.display == 'folders' ?
                    React.createElement(DataCardView, { folder })
                    : React.createElement(DataListView, { folder })
                }
            </Content>
        </Container>
    );
};