import React from "react";
import ProfileLayout from "../../components/Layouts/ProfileLayout";

import { editable } from "../../helpers/profile";

const list = [
    { label: "Name", value: "Chris Were", action: "arrow", type: "input" },
    { label: "Country", value: "Australia", action: "arrow", type: "select" },
    { label: "Description", value: null, action: "arrow", type: "textarea" }
];

export default () => (
    <ProfileLayout
        list={editable(list)}
        description={"This profile is public and can be discovered by others"} />
)
