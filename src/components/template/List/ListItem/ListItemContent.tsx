import type { ReactNode } from "react";

// Stylesheets
import style from "components/template/List/ListItem/ListItemContent.module.scss";

const ListItemContent = ({ fullscreen = false, children }: { fullscreen?: boolean; children?: ReactNode }) => {
    return <div className={`${style.listItemContent} ${fullscreen ? style.fullscreen : ""}`}>{children}</div>;
};

export default ListItemContent;
