import Label from "./Label";
import React from "react";

import ModifierStyles from "../styles/modifier";

export default ({ shown }) => ( shown &&
    <Label style={[ModifierStyles.label, ModifierStyles.errorText]}>
        Error: Please, enter a valid seed phrase
    </Label>
)
