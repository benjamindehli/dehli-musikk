// Dependencies
import React from "react";
import Link from "next/link";

// Types
import type { ListItemLink } from "components/template/List/ListItem/listItemLink";

// Stylesheets
import style from "components/template/List/ListItem/ListItemThumbnail.module.scss";

type ListItemThumbnailProps = {
    fullscreen?: boolean;
    compact?: boolean;
    link?: ListItemLink | null;
    children?: React.ReactNode;
};

type ImageSize = {
    width: string;
    height: string;
};

/*
 * The intrinsic size travels as data-width/data-height on the <img> the caller
 * nests, and is read back out here so the <figure> can reserve the box before
 * the image loads. Callers that pass their sources as one wrapping element get
 * a size; callers that pass a bare list of <source>/<img> siblings do not, and
 * fall back to no reservation.
 */
const getImageSize = (children: React.ReactNode): ImageSize | null => {
    if (!React.isValidElement(children)) return null;
    const nested = (children.props as { children?: React.ReactNode }).children;
    if (!Array.isArray(nested)) return null;
    const image = nested.find((child): child is React.ReactElement<Record<string, string>> => {
        if (!React.isValidElement(child) || child.type !== "img") return false;
        const props = child.props as Record<string, string>;
        return Boolean(props["data-width"] && props["data-height"]);
    });
    if (!image) return null;
    return {
        width: image.props["data-width"],
        height: image.props["data-height"]
    };
};

const ListItemThumbnail = ({ fullscreen = false, compact = false, link = null, children }: ListItemThumbnailProps) => {
    const imageSize = getImageSize(children);
    const classNames = [style.listItemThumbnail];
    if (fullscreen) classNames.push(style.fullscreen);
    if (compact) classNames.push(style.compact);
    const childElements = (
        <figure
            className={classNames.join(" ")}
            data-width={imageSize ? imageSize.width : null}
            data-height={imageSize ? imageSize.height : null}
            // Custom properties are not part of CSSProperties, and the stylesheet
            // reads them to derive the aspect ratio.
            style={{ "--w": imageSize ? imageSize.width : null, "--h": imageSize ? imageSize.height : null } as React.CSSProperties}
        >
            <picture>{children}</picture>
        </figure>
    );

    return link && !fullscreen ? (
        <Link href={link.to} title={link.title} tabIndex={-1}>
            {childElements}
        </Link>
    ) : (
        childElements
    );
};

export default ListItemThumbnail;
