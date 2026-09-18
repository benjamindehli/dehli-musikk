/*
 * Checks the storefront JSON-LD snippet against the site it borrows its @ids
 * from. Run from the repo root:
 *
 *   node scripts/verify-store-snippet.mjs
 *
 * scripts/store-jsonld-snippet.js is pasted into Gumroad's script snippets
 * field and runs on store.dehlimusikk.no, where it rewrites Gumroad's Product
 * node to carry this site's @id. Nothing deploys it and nothing imports it, so
 * every way it can rot is silent:
 *
 * - A product added to the store is simply missing from the snippet's list and
 *   keeps Gumroad's unlinked markup.
 * - A product removed from the site, or renamed, leaves the snippet minting an
 *   @id for a page that 404s, which is worse than no @id at all: it names a
 *   node nothing describes.
 * - A change to the @id convention in richSnippetsGenerators moves the site's
 *   node and leaves the storefront pointing at the old one, and the two stop
 *   merging without either page looking wrong on its own.
 *
 * The convention itself is checked by looking for the literal templates in the
 * generator source rather than by importing it: this stays a plain .mjs with no
 * transpile step, and a moved template is exactly the change worth catching.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const SNIPPET_PATH = "scripts/store-jsonld-snippet.js";
const GENERATOR_PATH = "src/helpers/richSnippetsGenerators.ts";
const PRODUCTS_PATH = "src/data/products/data/all.json";
const STORE_PREFIX = "https://store.dehlimusikk.no/l/";

const snippet = read(SNIPPET_PATH);
const generator = read(GENERATOR_PATH);
const products = JSON.parse(read(PRODUCTS_PATH));

const problems = [];
const report = (subject, message) => problems.push(`${subject}: ${message}`);

// --- the snippet's product list ------------------------------------------
const listMatch = snippet.match(/var PRODUCTS = \[([^\]]*)\]/);
if (!listMatch) {
    report(SNIPPET_PATH, "no PRODUCTS array found, so nothing below can be checked");
}
const listed = listMatch ? [...listMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]) : [];

// --- what the product data says is on the store ---------------------------
const storeSlugOf = (product) =>
    [product.link?.url, ...(product.sameAs || [])]
        .filter((url) => typeof url === "string" && url.startsWith(STORE_PREFIX))
        .map((url) => url.slice(STORE_PREFIX.length).split(/[/?#]/)[0])[0];

const onStore = new Map();
for (const product of products) {
    const slug = storeSlugOf(product);
    if (slug) onStore.set(slug, product.title);
}

listed
    .filter((slug) => !onStore.has(slug))
    .forEach((slug) => report(slug, "listed in the snippet but no product links to it on the store, so its @id may name nothing"));

[...onStore.keys()]
    .filter((slug) => !listed.includes(slug))
    .forEach((slug) => report(onStore.get(slug), `sold as /l/${slug} but missing from the snippet, so that page stays unlinked`));

listed.filter((slug, index) => listed.indexOf(slug) !== index).forEach((slug) => report(slug, "listed twice in the snippet"));

/*
 * The snippet derives the site slug from the store slug, which only holds
 * because convertToUrlFriendlyString(title) and the Gumroad slug agree for every
 * product. out/ is gitignored, so this runs against a build when there is one
 * and says so when there is not.
 */
const exportDir = path.join(ROOT, "out/products");
const built = fs.existsSync(exportDir) ? new Set(fs.readdirSync(exportDir)) : null;
if (built) {
    listed.filter((slug) => !built.has(slug)).forEach((slug) => report(slug, "no out/products page of that name, so the @id would 404"));
}

// --- the @id convention ---------------------------------------------------
const conventions = [
    ["product @id", "`https://www.dehlimusikk.no/products/${productId}/#product`", 'SITE + "products/" + slug + "/"'],
    ["brand @id", 'BRAND_JSON_LD_ID = "https://www.dehlimusikk.no/#brand"', 'SITE + "#brand"'],
    ["business @id", 'SITE_JSON_LD_ID = "https://www.dehlimusikk.no/"', 'var SITE = "https://www.dehlimusikk.no/"']
];

for (const [subject, inGenerator, inSnippet] of conventions) {
    if (!generator.includes(inGenerator)) report(subject, `${GENERATOR_PATH} no longer builds it as ${inGenerator}`);
    if (!snippet.includes(inSnippet)) report(subject, `${SNIPPET_PATH} no longer builds it as ${inSnippet}`);
}

// --- summary --------------------------------------------------------------
console.log(`products in data   ${products.length}`);
console.log(`sold on the store  ${onStore.size}`);
console.log(`listed in snippet  ${listed.length}`);
console.log(`checked against    ${built ? "out/products" : "no build (run next build for the 404 check)"}`);

if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    problems.forEach((problem) => console.log(`   ${problem}`));
} else {
    console.log("\nno problems found");
}

process.exitCode = problems.length ? 1 : 0;
