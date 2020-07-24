import {DATA_SNAPSHOT, DATA_SYNCHRONIZATION, EMPLOYMENT_REFERENCE} from "../constants/route";

import React from "react";
import DataSnapshot from "../assets/inbox/snapshot.svg";
import DataSynchronization from "../assets/inbox/synchronization.svg";

export const TYPES = [
    {
        id: 1,
        title: "Employment Reference",
        action: EMPLOYMENT_REFERENCE,
        svg: null
    },
    {
        id: 2,
        title: "Data Snapshot Request",
        action: DATA_SNAPSHOT,
        svg: <DataSnapshot />
    },
    {
        id: 3,
        title: "Data Synchronization Request",
        action: DATA_SYNCHRONIZATION,
        svg: <DataSynchronization />
    }
];

export const findTypeById = (id) => TYPES.find(type => type.id === id);
