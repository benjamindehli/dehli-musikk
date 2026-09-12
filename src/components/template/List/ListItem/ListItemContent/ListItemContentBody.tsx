import type { ReactNode } from "react";

// Stylesheets
import style from "components/template/List/ListItem/ListItemContent/ListItemContentBody.module.scss";

const ListItemContentBody = ({ fullscreen = false, children }: { fullscreen?: boolean; children?: ReactNode }) => {
    return <div className={`${style.listItemContentBody} ${fullscreen ? style.fullscreen : ""}`}>{children}</div>;
};

export default ListItemContentBody;
