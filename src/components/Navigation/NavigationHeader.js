import React from 'react';
import { Header, Left, Right, Body, Title, Button, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

export default ({ left = { icon: 'back' }, title, right = {} }) => {
    return (
        <Header transparent style={{ elevation: 1 }} androidStatusBarColor="light-gray">
            <Left style={{ flex: 0.2, marginLeft: 6 }}>
                {(function() {
                    switch (left.icon) {
                    case 'back':
                        return (
                            <Button transparent onPress={() => Actions.pop()}>
                                <Icon name='arrow-back' style={{ color: '#000' }} />
                            </Button>
                        );
                    case 'skip':
                        return null;
                    default:
                        return (
                            <Button transparent onPress={left.action}>
                                {left.icon}
                            </Button>
                        );
                    }
                })()}
            </Left>
            <Body style={{ flex: 1, alignItems: 'center' }}>
                {title ? (<Title style={{ color: '#000' }}>{title}</Title>) : null}
            </Body>
            <Right style={{ flex: 0.2 }}>
                { right.icon
                    ? (
                        <Button transparent onPress={right.action}>
                            {right.icon}
                        </Button>
                    )
                    : null
                }
            </Right>
        </Header>
    );
};
