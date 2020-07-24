import React from "react";
import Layout from "../components/Layouts/Layout";
import Search from "../components/Search";
import CardList from "../components/CardList";

const inboxList = [
    {
        id: 1,
        logo: "http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png",
        title: "IBM HR",
        from: "",
        createdAt: "May 25",
        type: 1,
        read: false
    },
    {
        id: 2,
        logo: "http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png",
        title: "Steve Smith",
        from: "Verida Health: ERM",
        createdAt: "May 25",
        type: 2,
        read: false
    },
    {
        id: 3,
        logo: "http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png",
        title: "Steve Smith",
        from: "Verida Health: ERM",
        createdAt: "May 25",
        type: 3,
        read: false
    }
];

export default () => {
    return (
        <Layout>
            <Search />
            <CardList list={inboxList} />
        </Layout>
    )
}
