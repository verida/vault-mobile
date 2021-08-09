import React, { useEffect, useState } from 'react';
import { Container, Content } from 'native-base';
import { connect } from 'react-redux';

import DataCardView from '../../components/Data/CardView';
import DataListView from '../../components/Data/ListView';

import NavigationHeader from 'components/Navigation/NavigationHeader';
import { getVault } from '../../api'

const Folder = ({ folderName }) => {
    const [folder, setFolder] = useState();

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const vault = await getVault();
        const folder = await vault.data.selectFolder(folderName)
        setFolder(folder)
    };

    return (
        <Container>
            <NavigationHeader title={ folder ? folder.config.titlePlural || folder.config.title : "" } />
            { folder ?
            <Content>
                {folder.config.display == 'folders' ?
                    React.createElement(DataCardView, { folder })
                    : React.createElement(DataListView, { folder })
                }
            </Content>
            : null }
        </Container>
    );
};

const mapDispatchToProps = dispatch => {
    return {};
};

const mapStateToProps = state => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Folder);
