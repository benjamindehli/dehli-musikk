// Dependencies
import React from "react";
import { useSelector } from "react-redux";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Selectors
import { getLanguageSlugByKey } from "reducers/AvailableLanguagesReducer";

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { convertToXmlFriendlyString } from "helpers/xmlStringFormatter";
import { formatContentAsString } from "helpers/contentFormatter";

// Data
import products from "data/products";

// Stylesheet
import style from "components/routes/Dashboard.module.scss";

const LocalInventory = () => {
    // Redux store
    const languageSlug = {
        no: useSelector((state) => getLanguageSlugByKey(state, "no")),
        en: useSelector((state) => getLanguageSlugByKey(state, "en"))
    };

    const getImageUrlFromProduct = (product) => {
        const format = "jpg";
        const size = 540;
        const imagePath = `data/products/thumbnails/web/${format}/${convertToUrlFriendlyString(product.title)}`;
        const imageUrl = require(`../../${imagePath}_${size}.${format}`);
        return imageUrl;
    };

    const renderIdElement = (product, languageKey) => {
        return `<g:id>${languageKey}-${convertToUrlFriendlyString(product.title)}</g:id>`;
    };

    const renderTitleElement = (title) => {
        return `<g:title>${convertToXmlFriendlyString(title)}</g:title>`;
    };

    const renderDescriptionElement = (description) => {
        const descriptionAsString = formatContentAsString(description);
        return `<g:description>${convertToXmlFriendlyString(descriptionAsString)}</g:description>`;
    };

    const renderLinkElement = (url) => {
        return `<g:link>https://www.dehlimusikk.no/${url}</g:link>`;
    };

    const renderImageLinkElement = (product) => {
        const imageUrl = getImageUrlFromProduct(product);
        const absoluteImageUrl = `https://www.dehlimusikk.no${imageUrl}`;
        return `<g:image_link>${absoluteImageUrl}</g:image_link>`;
    };

    const renderConditionElement = () => {
        const condition = "new";
        return `<g:condition>${condition}</g:condition>`;
    };

    const renderBrandElement = () => {
        const brand = "Dehli Musikk";
        return `<g:brand>${brand}</g:brand>`;
    };

    const renderProductTypeElement = (product) => {
        const productType = product.productType.join(" &gt; ");
        return `<g:product_type>${productType}</g:product_type>`;
    };

    const renderGoogleProductCategoryElement = () => {
        const googleProductCategory = "313";
        return `<g:google_product_category>${googleProductCategory}</g:google_product_category>`;
    };

    const renderIdentifierExistsElement = () => {
        const identifierExists = "no";
        return `<g:identifier_exists>${identifierExists}</g:identifier_exists>`;
    };

    const renderAdultElement = () => {
        const adult = "no";
        return `<g:adult>${adult}</g:adult>`;
    };

    const renderIncludedDestinationElement = () => {
        const includedDestination = ["Free listings", "Shopping ads", "Free local listings"];
        return includedDestination
            .map((destination) => `<g:included_destination>${destination}</g:included_destination>`)
            .join("\n");
    };

    const renderStoreCodeElement = () => {
        const storeCode = "04516683628261596954";
        return `<g:store_code>${storeCode}</g:store_code>`;
    };

    const renderAvailabilityElement = () => {
        const availability = "in stock";
        return `<g:availability>${availability}</g:availability>`;
    };

    const renderPriceElement = (price, currency) => {
        return price && currency ? `<g:price>${price} ${currency}</g:price>` : "";
    };

    const renderProductElements = (languageKey) => {
        return products?.length
            ? products
                  .map((product) => {
                      const url = `${languageSlug[languageKey]}products/${convertToUrlFriendlyString(product.title)}`;
                      return `<item>
        ${renderIdElement(product, languageKey)}
        ${renderTitleElement(product.title)}
        ${renderDescriptionElement(product.content[languageKey])}
        ${renderLinkElement(url)}
        ${renderImageLinkElement(product)}
        ${renderConditionElement()}
        ${renderAvailabilityElement()}
        ${renderPriceElement(product?.price, product?.priceCurrency)}
        ${renderGoogleProductCategoryElement()}
        ${renderIdentifierExistsElement()}
        ${renderAdultElement()}
        ${renderIncludedDestinationElement()}
        ${renderBrandElement()}
        ${renderProductTypeElement(product)}
        </item>\n`;
                  })
                  .join("")
            : "";
    };

    const renderInventoryItemElements = (languageKey) => {
        return products?.length
            ? products
                  .map((product) => {
                      return `<item>
                ${renderIdElement(product, languageKey)}
                ${renderStoreCodeElement()}
                ${renderAvailabilityElement()}
                ${renderPriceElement(product?.price, product?.priceCurrency)}
                </item>\n`;
                  })
                  .join("")
            : "";
    };

    const getProductsXML = (languageKey) => {
        return [
            '<?xml version="1.0" encoding="UTF-8"?>\n',
            '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n',
            "<channel>\n",
            `<title>Products - Dehli Musikk</title>\n`,
            "<link>https://www.dehlimusikk.no/</link>\n",
            "<description></description>\n",
            renderProductElements(languageKey),
            "</channel>\n",
            "</rss>"
        ].join("");
    };

    const getLocalInventoryXML = (languageKey) => {
        return [
            '<?xml version="1.0" encoding="UTF-8"?>\n',
            '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n',
            "<channel>\n",
            `<title>Products - Dehli Musikk</title>\n`,
            "<link>https://www.dehlimusikk.no/</link>\n",
            "<description></description>\n",
            renderInventoryItemElements(languageKey),
            "</channel>\n",
            "</rss>"
        ].join("");
    };

    const saveFileContent = (fileContent, fileName) => {
        const blob = new Blob([fileContent], {
            type: "application/xml;charset=utf-8"
        });
        saveAs(blob, fileName);
    };

    return (
        <div className={style.grid}>
            <button className={style.gridItem} onClick={() => saveFileContent(getProductsXML("no"), "products-no.rss")}>
                <span className={style.gridItemIcon}>
                    <FontAwesomeIcon icon={["fas", "rss"]} size="3x" />
                    <span className={style.gridItemIconBadge}>
                        <FontAwesomeIcon icon={["fas", "download"]} />
                    </span>
                </span>
                <span className={style.gridItemName}>products-no.rss</span>
            </button>
            <button className={style.gridItem} onClick={() => saveFileContent(getProductsXML("en"), "products-en.rss")}>
                <span className={style.gridItemIcon}>
                    <FontAwesomeIcon icon={["fas", "rss"]} size="3x" />
                    <span className={style.gridItemIconBadge}>
                        <FontAwesomeIcon icon={["fas", "download"]} />
                    </span>
                </span>
                <span className={style.gridItemName}>products-en.rss</span>
            </button>
            <button
                className={style.gridItem}
                onClick={() => saveFileContent(getLocalInventoryXML("no"), "local-inventory-no.rss")}
            >
                <span className={style.gridItemIcon}>
                    <FontAwesomeIcon icon={["fas", "rss"]} size="3x" />
                    <span className={style.gridItemIconBadge}>
                        <FontAwesomeIcon icon={["fas", "download"]} />
                    </span>
                </span>
                <span className={style.gridItemName}>local-inventory-no.rss</span>
            </button>
            <button
                className={style.gridItem}
                onClick={() => saveFileContent(getLocalInventoryXML("en"), "local-inventory-en.rss")}
            >
                <span className={style.gridItemIcon}>
                    <FontAwesomeIcon icon={["fas", "rss"]} size="3x" />
                    <span className={style.gridItemIconBadge}>
                        <FontAwesomeIcon icon={["fas", "download"]} />
                    </span>
                </span>
                <span className={style.gridItemName}>local-inventory-en.rss</span>
            </button>
        </div>
    );
};

export default LocalInventory;
