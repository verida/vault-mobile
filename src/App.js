import React, { useState, useEffect } from "react";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import Routes from "./routes";

// import { connect } from "./api/verida";
// import { connect } from "./api/datastore"

export default () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const Avenir = require("./assets/fonts/Avenir.otf");
            await Font.loadAsync({ Avenir });
            // connect();
            setLoading(false);
        })();
    }, []);

    return (loading && <AppLoading />) || <Routes />;
};
