import React from "react";
import Record from "./Record";

export default ({ list }) => {
    return list.map((item) => <Record item={item} key={`record - ${item.id}`}/>)
}
