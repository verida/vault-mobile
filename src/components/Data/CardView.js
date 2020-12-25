import React, { useEffect, useState } from 'react'
import { Actions } from 'react-native-router-flux'
import { View, StyleSheet } from 'react-native'

import DataCardList from './DataCardList'
import { getVault } from '../../api'

import {
    DATA_FOLDER
} from '../../constants/route'


export default CardView = ({ folder }) => {
    const [list, setList] = useState([]);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {        
        const vault = await getVault()
        const { navigation, folders } = vault.data.map

        const list = folder.config.folders.map(folderName => {
            const { title, titlePlural, icon } = folders[folderName]

            return {
                label: titlePlural || title,
                icon: icon,
                onPress: () => Actions[DATA_FOLDER]({ folderName: folderName })
            }
        });

        setList(list)
    };

    return (
        <View>
            <View style={style.itemsList}>
                <DataCardList list={list} />
            </View>
        </View>
    );
};

const style = StyleSheet.create({
    itemsList: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});
