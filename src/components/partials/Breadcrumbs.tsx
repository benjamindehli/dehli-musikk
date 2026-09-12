// Dependencies
import React from "react";
import Link from "next/link";

// Components
import JsonLd from "components/JsonLd";

// Stylesheets
import style from "components/partials/Breadcrumbs.module.scss";

/*
 * One rung of the trail, in the order it is rendered. `path` is site-relative
 * and carries its own language slug, because the trail is built by the page and
 * a Norwegian page links to Norwegian ancestors.
 */
export type Breadcrumb = {
    name: string;
    path: string;
};

type BreadcrumbsProps = {
    breadcrumbs?: Breadcrumb[];
    languageSlug: string;
};

type ListItem = {
    "@type": "ListItem";
    position: number;
    item: string;
    name: string;
};

const Breadcrumbs = ({ breadcrumbs = [], languageSlug }: BreadcrumbsProps) => {
    const renderBreadcrumbJsonLd = (breadcrumbs: Breadcrumb[]) => {
        const originUrl = "https://www.dehlimusikk.no";
        const itemListElement: ListItem[] = [
            {
                "@type": "ListItem",
                position: 1,
                item: `${originUrl}/${languageSlug}`,
                name: "Dehli Musikk"
            }
        ];
        breadcrumbs.forEach((breadcrumb, index) => {
            itemListElement.push({
                "@type": "ListItem",
                position: index + 2,
                item: `${originUrl}${breadcrumb.path}`,
                name: breadcrumb.name
            });
        });
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement
        };
    };

    const renderBreadcrumbListElements = (breadcrumbs: Breadcrumb[]) => {
        return breadcrumbs.map((breadcrumb, key) => {
            return key === breadcrumbs.length - 1 ? (
                <li key={key}>
                    <span>{breadcrumb.name}</span>
                </li>
            ) : (
                <li key={key}>
                    <Link href={breadcrumb.path} title={breadcrumb.name}>
                        {breadcrumb.name}
                    </Link>
                </li>
            );
        });
    };

    return (
        <React.Fragment>
            <JsonLd data={renderBreadcrumbJsonLd(breadcrumbs)} />
            <nav className={style.breadcrumbs}>
                <ul aria-label="Breadcrumbs for current page path">
                    <li>
                        <Link href={`/${languageSlug}`} title="Dehli Musikk">
                            Dehli Musikk
                        </Link>
                    </li>
                    {renderBreadcrumbListElements(breadcrumbs)}
                </ul>
            </nav>
        </React.Fragment>
    );
};

export default Breadcrumbs;
