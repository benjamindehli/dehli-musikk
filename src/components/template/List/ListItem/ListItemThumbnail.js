// Dependencies
import { Link } from "react-router-dom";

// Stylesheets
import style from "components/template/List/ListItem/ListItemThumbnail.module.scss";

const ListItemThumbnail = ({ fullscreen, compact, link, children }) => {
    const getImageSize = () => {
        const image = children?.props?.children?.find((child) => {
            return child?.type === "img" && child?.props?.["data-width"] && child?.props?.["data-height"];
        });
        if (image) {
            return {
                width: image.props["data-width"],
                height: image.props["data-height"]
            };
        }
        return null;
    };
    const imageSize = getImageSize();
    const classNames = [style.listItemThumbnail];
    if (fullscreen) classNames.push(style.fullscreen);
    if (compact) classNames.push(style.compact);
    const childElements = (
        <figure
            className={classNames.join(" ")}
            data-width={imageSize ? imageSize.width : null}
            data-height={imageSize ? imageSize.height : null}
        >
            <picture>{children}</picture>
        </figure>
    );

    return link && !fullscreen ? (
        <Link to={link.to} title={link.title} tabIndex="-1">
            {childElements}
        </Link>
    ) : (
        childElements
    );
};

export default ListItemThumbnail;
