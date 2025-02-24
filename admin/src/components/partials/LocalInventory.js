// Dependencies
import React from "react";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Data
import products from "data/products";

// Stylesheet
import style from "components/routes/Dashboard.module.scss";

const LocalInventory = () => {
    const renderIdElement = (id) => {
        return `<g:id>${id}</g:id>`;
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

    const renderPostItemElements = () => {
        return products?.length
            ? products
                  .map((product) => {
                      return `<item>
                ${renderIdElement(product.merchantCenterId)}
                ${renderStoreCodeElement()}
                ${renderAvailabilityElement()}
                ${renderPriceElement(product?.price, product?.priceCurrency)}
                </item>\n`;
                  })
                  .join("")
            : "";
    };

    const getLocalInventoryXML = () => {
        return [
            '<?xml version="1.0" encoding="UTF-8"?>\n',
            '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n',
            "<channel>\n",
            `<title>Products - Dehli Musikk</title>\n`,
            "<link>https://www.dehlimusikk.no/</link>\n",
            "<description></description>\n",
            renderPostItemElements(),
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
            <button
                className={style.gridItem}
                onClick={() => saveFileContent(getLocalInventoryXML(), "local-inventory.rss")}
            >
                <span className={style.gridItemIcon}>
                    <FontAwesomeIcon icon={["fas", "rss"]} size="3x" />
                    <span className={style.gridItemIconBadge}>
                        <FontAwesomeIcon icon={["fas", "download"]} />
                    </span>
                </span>
                <span className={style.gridItemName}>local-inventory.rss</span>
            </button>
        </div>
    );
};

export default LocalInventory;
