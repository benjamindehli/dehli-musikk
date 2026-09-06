/*
 * The URLs from a product's sameAs that are worth showing a reader, used by the
 * markdown twins and by llms-full.txt.
 *
 * The product pages themselves render only the store and documentation links,
 * but their JSON-LD carries the whole sameAs list. Without this, a reader of the
 * twin sees strictly less than a crawler parsing the same page, which is
 * backwards: the twin exists to say in prose what the page says in markup.
 *
 * Two hosts are left out on purpose, and both look like omissions until you
 * check what they point at:
 *
 * - Gumroad is the same storefront as store.dehlimusikk.no, which is already
 *   printed above as the store link. Listing it again offers a second URL to one
 *   checkout.
 * - Cylex entries are business-directory listings that repeat the product name
 *   and carry no detail of their own.
 *
 * Everything else in sameAs names a place the product genuinely lives - the
 * source repository, the demo video, KVR Audio, Pianobook, press coverage - so
 * the filter is a deny list rather than an allow list, and a new kind of listing
 * shows up without anyone having to add it here.
 */
const REDUNDANT_HOSTS = ["dehlimusikk.gumroad.com", "cylex.no"];

// Deliberately not new URL(): this runs while the static export is being built,
// where one malformed string in the data should not take the whole build down.
const hostOf = (url) =>
    url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];

export const getAdditionalProductLinks = (product) => {
    const alreadyShown = [product.link?.url, product.documentationLink?.url].filter(Boolean);
    return (product.sameAs ?? []).filter((url) => !alreadyShown.includes(url) && !REDUNDANT_HOSTS.includes(hostOf(url)));
};
