import { Actions } from 'react-native-router-flux';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Container, Content, List } from 'native-base';

import DataList from '../../components/DataList';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { getVault } from '../../api'

import {
    DATA_FOLDER
} from '../../constants/route';

const Folders = (props) => {
    const [list, setList] = useState([]);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const vault = await getVault()

        // @todo: vault-common
        const { navigation, folders } = vault.data.map

        const items = navigation.map(folder => {
            if (!folders[folder]) {
                // folder doesn't exist
                console.error(`${folder} is listed in navigation, but not defined in map.json`)
                return
            }

            const { title, titlePlural, icon } = folders[folder]

            return {
                label: titlePlural || title,
                icon: icon,
                onPress: () => Actions[DATA_FOLDER]({ folderName: folder })
            }
        });

        setList(items)
    };

    return (
        <Container>
            <NavigationHeader left = {{ icon: 'skip' }} title="Data" />
            <Content>
                <List>
                    <DataList list={list} />
                </List>
            </Content>
        </Container>
    );
};

const mapDispatchToProps = dispatch => {
    return {};
};

const mapStateToProps = state => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Folders);


/*const list = [
    { label: 'Identity', icon: <IdentitySvg />, onPress: () => Actions[IDENTITY]() },
    { label: 'Health', icon: <HealthSvg />, onPress: () => Actions[HEALTH]() },
    { label: 'Employment', icon: <EmploymentSvg />, onPress: () => Actions[EMPLOYMENT]() },
    { label: 'Finance', icon: <FinanceSvg />, onPress: () => Actions[FINANCE]() },
    { label: 'Qualifications', icon: <QualificationsSvg />, onPress: () => Actions[QUALIFICATIONS]() },
    { label: 'Insurance', icon: <InsuranceSvg />, onPress: () => Actions[INSURANCE]() },
    { label: 'Social', icon: <SocialSvg />, onPress: () => Actions[SOCIAL]() },
    { label: 'Subscriptions', icon: <SubscriptionsSvg />, onPress: () => Actions[SUBSCRIPTIONS]() },
    { label: 'Tickets', icon: <TicketsSvg />, onPress: () => Actions[TICKETS]() },
    { label: 'Documents', icon: <DocumentsSvg />, onPress: () => Actions[DOCUMENTS]() },
];*/
