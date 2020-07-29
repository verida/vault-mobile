import Label from "./Label";
import React from "react";

import ModifierStyles from "../styles/modifier";

export default ({ shown, style }) => (
    <Label style={[ModifierStyles.label, ModifierStyles.errorText, style]}>
        { shown && "Error: Please, enter a valid seed phrase" || null }
    </Label>
)
