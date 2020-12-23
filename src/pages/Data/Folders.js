import { Actions } from 'react-native-router-flux';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Container, Content, List } from 'native-base';

import DataList from '../../components/DataList';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { getVault } from '../../api'

import IdentitySvg from '../../assets/icons/data/identity.svg';
import HealthSvg from '../../assets/icons/data/health.svg';
import EmploymentSvg from '../../assets/icons/data/employment.svg';
import FinanceSvg from '../../assets/icons/data/finance.svg';
import QualificationsSvg from '../../assets/icons/data/qualifications.svg';
import InsuranceSvg from '../../assets/icons/data/insurance.svg';
import SocialSvg from '../../assets/icons/data/social.svg';
import SubscriptionsSvg from '../../assets/icons/data/subscriptions.svg';
import TicketsSvg from '../../assets/icons/data/tickets.svg';
import DocumentsSvg from '../../assets/icons/data/documents.svg';

import {
    IDENTITY,
    HEALTH,
    EMPLOYMENT,
    FINANCE,
    QUALIFICATIONS,
    INSURANCE,
    SOCIAL,
    SUBSCRIPTIONS,
    TICKETS,
    DOCUMENTS,
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
            const { title, titlePlural, icon } = folders[folder]

            return {
                label: titlePlural || title,
                icon: icon,
                onPress: () => Actions[IDENTITY]()
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
    return {
        //setNewMessagesCount: data => dispatch(setNewMessagesCount(data)),
    };
};

const mapStateToProps = state => {
    //return { newMessagesCount: state.newMessagesCount };
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
