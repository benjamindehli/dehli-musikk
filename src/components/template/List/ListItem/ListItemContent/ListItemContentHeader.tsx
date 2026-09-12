// Dependencies
import React from "react";
import Link from "next/link";

// Types
import type { ListItemLink } from "components/template/List/ListItem/listItemLink";

// Stylesheets
import style from "components/template/List/ListItem/ListItemContent/ListItemContentHeader.module.scss";

type ListItemContentHeaderProps = {
    fullscreen?: boolean;
    link?: ListItemLink | null;
    children?: React.ReactNode;
};

const ListItemContentHeader = ({ fullscreen = false, link = null, children }: ListItemContentHeaderProps) => {
    const renderContent = (link: ListItemLink | null, children: React.ReactNode) => {
        return link && !fullscreen ? (
            <Link href={link.to} title={link.title} data-tabable={true}>
                {children}
            </Link>
        ) : (
            children
        );
    };

    return <header className={`${style.listItemContentHeader} ${fullscreen ? style.fullscreen : ""}`}>{renderContent(link, children)}</header>;
};

export default ListItemContentHeader;
