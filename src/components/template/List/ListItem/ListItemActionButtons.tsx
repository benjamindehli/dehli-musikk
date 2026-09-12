import type { ReactNode } from "react";

// Stylesheets
import style from "components/template/List/ListItem/ListItemActionButtons.module.scss";

const ListItemActionButtons = ({ fullscreen, children }: { fullscreen?: boolean; children?: ReactNode }) => {
    return <div className={`${style.listItemActionButtons} ${fullscreen ? style.fullscreen : ""}`}>{children}</div>;
};

export default ListItemActionButtons;
