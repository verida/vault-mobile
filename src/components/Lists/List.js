import React from "react";
import Text from "../Text";
import TextStyles from "../../styles/text";

export default ({ items }) => items.map((item, index) => (
    <Text key={`aspects-${index}`} style={[TextStyles.grey, { marginTop: 20 }]}>
        &#9679; <Text>{ item }</Text>
    </Text>
));
