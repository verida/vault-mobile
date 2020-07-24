import './global'

import React, { useState, useEffect } from "react";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import Routes from "./routes";

export default () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const Avenir = require("./assets/fonts/Avenir.otf");
            await Font.loadAsync({ Avenir });
            setLoading(false);
        })();
    }, []);

    return (loading && <AppLoading />) || <Routes />;
};
