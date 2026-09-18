/*
 * store.dehlimusikk.no - the custom JS snippet pasted into Gumroad's script
 * snippets field. Nothing in this repo builds, bundles or serves this file: it
 * lives here so the @id convention has one home, and so verify:store can tell
 * when the site has moved on without the storefront following.
 *
 *   node scripts/verify-store-snippet.mjs
 *
 * Gumroad renders a Product JSON-LD node per product page with no @id, so
 * nothing ties it to the same product on www.dehlimusikk.no. This rewrites that
 * node in place to carry the site's @id, which is what makes the two pages
 * describe one product instead of two.
 *
 * The site is the authority: it already points at the store through offers.url
 * and sameAs, server rendered, in generateProductSnippet. This is the return
 * link, and it only exists once a consumer runs the page's JavaScript -
 * Googlebot renders, most other crawlers do not - so it is a bonus rather than
 * something the linking depends on.
 *
 * After changing this, paste it back into the storefront: the copy here is not
 * deployed by anything.
 */
(function () {
    "use strict";

    var SITE = "https://www.dehlimusikk.no/";

    /*
     * Products that exist on both sites. The Gumroad slug in /l/<slug> is the
     * same string as the site's product slug for every one of them, so the list
     * is not a lookup - it is a guard, so a store-only product never claims an
     * @id that 404s on the site. A product published both places needs one line
     * added here, which verify:store checks against the product data.
     */
    var PRODUCTS = [
        "4-track-glockenspiel",
        "4-track-music-box",
        "4-track-toy-piano",
        "dxtraterrestrial-1",
        "dxtraterrestrial-2",
        "edb-orgel",
        "elektrisk-salmesykkel",
        "lo-fi-tape-piano",
        "maskintrommer",
        "midnight-wurli",
        "omni-84",
        "strykebrett",
        "stylopoly",
        "subc",
        "voltage-controlled-cassette-organ"
    ];

    // /l/<slug>, plus whatever Gumroad appends for offer codes and variants
    function slugFromPath() {
        var match = window.location.pathname.match(/^\/l\/([a-z0-9-]+)/);
        return match && PRODUCTS.indexOf(match[1]) !== -1 ? match[1] : null;
    }

    function isProduct(node) {
        if (!node || typeof node !== "object") return false;
        var type = node["@type"];
        return type === "Product" || (Array.isArray(type) && type.indexOf("Product") !== -1);
    }

    // The payload is a single node today; @graph and top level arrays are
    // handled anyway so a change on Gumroad's side does not silently stop this.
    function productNodesIn(data) {
        var candidates = Array.isArray(data) ? data : Array.isArray(data && data["@graph"]) ? data["@graph"] : [data];
        return candidates.filter(isProduct);
    }

    function withoutDuplicates(existing, added) {
        var list = (Array.isArray(existing) ? existing : existing ? [existing] : []).slice();
        added.forEach(function (url) {
            if (list.indexOf(url) === -1) list.push(url);
        });
        return list;
    }

    function rewrite(slug) {
        var pageUrl = SITE + "products/" + slug + "/";
        var productId = pageUrl + "#product";
        var scripts = document.querySelectorAll('script[type="application/ld+json"]');

        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            var data;
            try {
                data = JSON.parse(script.textContent);
            } catch {
                continue;
            }

            var products = productNodesIn(data);
            // Already ours: the bail that keeps the observer below from
            // reacting to this function's own write, over and over.
            if (!products.length || products[0]["@id"] === productId) continue;

            products.forEach(function (product) {
                /*
                 * Same @id means same node, so a consumer merges this with the
                 * node on the site rather than holding two products that happen
                 * to share a name. #product keeps it clear of the page itself,
                 * the same convention the site uses.
                 */
                product["@id"] = productId;

                /*
                 * The identity claim above is the strong one; this is the weak
                 * one that survives a consumer ignoring @id. Both languages,
                 * because either page is a fair reference page for the product.
                 */
                product.sameAs = withoutDuplicates(product.sameAs, [pageUrl, SITE + "en/products/" + slug + "/"]);

                // Gumroad's brand is an anonymous "Dehli Musikk"; the site's
                // brand node is shared across every product page. One @id, one
                // brand, instead of a nameless copy per storefront.
                product.brand = { "@type": "Brand", "@id": SITE + "#brand", name: "Dehli Musikk" };

                // The offer stays Gumroad's - its price and availability are the
                // ones that apply here - but naming the seller ties it to the
                // business node the site describes in full.
                if (product.offers && !product.offers.seller) {
                    product.offers.seller = { "@type": "Organization", "@id": SITE, name: "Dehli Musikk" };
                }
            });

            script.textContent = JSON.stringify(data);
        }
    }

    function run() {
        try {
            var slug = slugFromPath();
            if (slug) rewrite(slug);
        } catch {
            // A storefront must not break over a structured data nicety
        }
    }

    run();
    document.addEventListener("DOMContentLoaded", run);

    /*
     * Gumroad is an Inertia app: a client side navigation swaps the
     * structured-data script for the next product's, undoing the rewrite. The
     * documented event covers the normal case and the observer covers the rest,
     * both cheap because the script lives in <head> and rewrite() bails when
     * there is nothing to do.
     */
    document.addEventListener("inertia:navigate", run);
    if (typeof MutationObserver === "function") {
        new MutationObserver(run).observe(document.head || document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
})();
