import React from 'react';
import DataSnapshot from '../assets/inbox/snapshot.svg';
import DataSynchronization from '../assets/inbox/synchronization.svg';

export const TYPES = [
    {
        id: 'inbox/type/dataSend',
        title: 'Incoming Data',
        svg: (width = 20, height = 20, style = {}) => <DataSnapshot width={width} height={height} style={style} />
    },
    {
        id: 'inbox/type/dataRequest',
        title: 'Request for Data',
        svg: (width = 20, height = 20, style = {}) => <DataSnapshot width={width} height={height} style={style} />
    },
    {
        id: 'inbox/type/databaseSync',
        title: 'Database Sync Request',
        svg: (width = 20, height = 20, style= {}) => <DataSynchronization width={width} height={height} style={style}/>
    },
    {
        id: 'inbox/type/datastoreSync',
        title: 'Datastore Sync Request',
        svg: (width = 20, height = 20, style= {}) => <DataSynchronization width={width} height={height} style={style}/>
    },
    {
        id: 'unknown',
        title: 'Unknown'
    }
];

export const findTypeById = (id) => TYPES.find(type => type.id === id) || TYPES.find(type => type.id === 'unknown');