# Admin dashboard

A local editor for the site's content. It replaces the old standalone React authoring app.

```bash
yarn admin
```

Then open http://127.0.0.1:3100/.

## How it works

- **It saves straight to the repo.** Edits go to `src/data`, and images to `public/data` and `public/product-images`, in this checkout. There is no downloading and copying files any more. Review the result with `git diff`, commit as usual, and release as before. Nothing here deploys anything.
- **It only runs locally.** It runs as `next dev`, bound to 127.0.0.1. `next.config.mjs` refuses `next build`, `next start` and any run with `CI` set, so it cannot end up on a server.
- **It is not part of the site.** The site is a static export built from `src/app`. The root `tsconfig.json` excludes `admin/`, and nothing under `admin/` reaches `out/` or Firebase.
- **It has no dependencies of its own.** Next.js, React, TypeScript and sharp come from the repo root. It imports the site's types and helpers from `src/`, so slugs, URLs and ids are worked out by the same code the site uses.

Typecheck it with `yarn admin:typecheck`. The root `yarn typecheck` does not cover it. Lint and Prettier cover it as part of the root `yarn lint` and `yarn format:check`.

## Sections

| Section   | Data                                                                            | Images                                                                   |
| --------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Posts     | `src/data/posts/data/all.json`                                                  | `public/data/posts/web`                                                  |
| Videos    | `src/data/videos/data/all.json`                                                 | `public/data/videos/web`                                                 |
| Releases  | `src/data/releases/data/*.json`, `src/data/linkedData/releasesInstruments.json` | `public/data/releases/web`                                               |
| Products  | `src/data/products/data/all.json`, `productsEquipment.json`                     | `public/data/products/web`, `public/product-images`, the gallery encoder |
| Equipment | `src/data/equipment/data/*.json`                                                | `public/data/equipment/<type>/web`                                       |
| FAQ       | `src/data/frequentlyAskedQuestions/data/all.json`                               | none                                                                     |

## Things that are fixed once created

The site builds URLs, image names and links out of these values, so the admin sets them once and does not change them afterwards:

- **Post and video ids and image names** (`2026101800`, `2026-10-18-00`) come from the date and order number at creation. Changing the date later does not rename them.
- **Release slugs and file names** (`kaasin-wrong`, `kAASIN_wrong.json`) come from the artist and title at creation. Instrument links and albums refer to the slug.
- **Product and equipment slugs** come from the title, or the brand and model. A change that keeps the slug is allowed, such as a capitalisation fix. A real rename is refused, because images, links between items, and links inside post and video text all use the old slug. Do that by hand, and search the data for the old slug.
- **Post and video URLs** come from the title in each language. The editor shows the URL, and warns when an edit would change it.

## Thumbnails

Every editor except the FAQ has a thumbnail panel. It makes every size in avif, webp and jpg from one image, in the shapes the site uses:

- **Posts, products and equipment:** 55, 110, 350x260, 540x400 and 1200x889. Equipment adds 945x700.
- **Videos:** 55, 110, 350x197, 540x304 and 1200x675.
- **Releases:** square 55, 110, 350, 540 and 1200.

The 1200 size is the share image. Pages use it for `og:image` once it exists (see `shareImage` in `src/helpers/thumbnailUrls.ts`). It is skipped when the source is too small, rather than enlarged. Videos can use their YouTube thumbnail as the source, and releases their Spotify cover.

Our own images are marked the way the hand-exported ones were, with two checkboxes on the panel:

- **Watermark:** "Benjamin Dehli / www.dehlimusikk.no" bottom left, and the logo (`admin/assets/watermark-logo.svg`, at 70%) bottom right. It goes on the sizes from 540 up. It is on by default for equipment, and for posts marked as copyright. Untick it for screenshots of products.
- **Copyright credit:** creator, credit, copyright notice and location in the jpegs' XMP, IPTC and EXIF. It is on by default for equipment and products, for posts and videos marked as copyright, and for any set whose current files carry it. Regenerating a set keeps the year its files already have.

The text is set in Helvetica, which the Mac has. On a machine without it, the text falls back to a similar font.

Product gallery images are uploaded on the product page and encoded by the same script as `yarn images:products`, through the button there.

## What happened to the old app's features

| Old app                                    | Now                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Posts, videos and portfolio editors        | Here, saving in place, with the fields the old forms were missing                 |
| Download `all.json` / `latest.json`        | Gone. Files are written directly, and the site works out "latest" itself          |
| Fetch a release from song.link             | "Fill from Odesli" on the release page                                            |
| Sitemaps, news, image and video sitemaps   | Generated by the site build (`src/app/sitemap.ts` and the `*-sitemap.xml` routes) |
| RSS feeds, product feeds, local inventory  | Generated by the site build (`src/app/*.rss` routes)                              |
| Statistics                                 | The equipment page shows each item's releases, products and text links            |
| Thumbnails exported by hand                | The thumbnail panel                                                               |
| Products, equipment and FAQ edited as JSON | Their own editors                                                                 |
