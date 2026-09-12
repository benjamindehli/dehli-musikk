import type { ReactNode } from "react";

// Stylesheets
import style from "components/template/List/ListItem.module.scss";

const ListItem = ({
    fullscreen = false,
    article = false,
    compact = false,
    children
}: {
    fullscreen?: boolean;
    article?: boolean;
    compact?: boolean;
    children?: ReactNode;
}) => {
    const CustomTag = article ? "article" : "div";
    return <CustomTag className={`${style.listItem} ${fullscreen ? style.fullscreen : ""} ${compact ? style.compact : ""}`}>{children}</CustomTag>;
};

export default ListItem;
