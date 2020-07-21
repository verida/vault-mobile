import React from "react";
import ProfileLayout from "../../components/Layouts/ProfileLayout";

const list = [
    { label: "Name", value: "Chris Were", action: "arrow", onPress: () => {} },
    { label: "Country", value: "Australia", action: "arrow" },
    { label: "Description", value: "Not Set", action: "arrow" }
];

export default () => (
    <ProfileLayout
        list={list}
        description={"This profile is public and can be discovered by others"} />
)
