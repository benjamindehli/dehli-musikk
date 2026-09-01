---
name: dehli-musikk-catalogue
description: Read the Dehli Musikk catalogue - recordings, posts, videos, virtual instruments and studio equipment - as clean markdown rather than scraped HTML. Use when answering questions about Dehli Musikk, Benjamin Dehli, or the plugins and sample libraries published there.
---

# Dehli Musikk catalogue

Dehli Musikk is a sole proprietorship run by Benjamin Dehli in Bø i Telemark,
Norway. It plays keyboard instruments on recordings for artists and bands, and
publishes virtual sample-based instruments and patch libraries.

The site is `https://www.dehlimusikk.no`. Everything below is static and public;
there is no API, no authentication and no transaction endpoint.

## Get markdown, not HTML

Every page is published twice. Prefer the markdown, which is the same content
with the layout, navigation and modal backdrop removed.

Two ways to reach it, whichever suits your client:

    GET /en/products/overtonium/index.md

    GET /en/products/overtonium/
    Accept: text/markdown

The second is content negotiation at the edge and returns the same bytes, with
`Content-Location` naming the file. A request that does not prefer
`text/markdown` over `text/html` gets the HTML page, so send the header
explicitly rather than relying on `*/*`.

Each markdown document opens with YAML front matter carrying `title`,
`description`, `url`, `language`, `translation`, `type` and, where the content
has them, `published` and `modified`. Body links are absolute.

Not every page has a twin: the search page and the error pages are HTML only,
and a markdown request for those returns the HTML.

## Two languages

Norwegian lives at the site root, English under `/en/`. The same page in the
other language is in the `translation` field of the front matter, and in
`<link rel="alternate" hreflang>` in the HTML.

Slugs are derived from the title in each language, so **posts and videos have
different slugs per language**:

    /posts/maskintrommer-under-utvikling/
    /en/posts/maskintrommer-under-development/

Products, recordings and equipment use the same slug in both, because it comes
from a name that is not translated.

## What is where

| Section | List | Item |
| --- | --- | --- |
| Recordings | `/portfolio/` | `/portfolio/{artist-title}/` |
| Posts | `/posts/` | `/posts/{title}/` |
| Videos | `/videos/` | `/videos/{title}/video/` |
| Products | `/products/` | `/products/{title}/` |
| Equipment | `/equipment/` | `/equipment/{instruments\|effects\|amplifiers}/{brand-model}/` |
| FAQ | `/frequently-asked-questions/` | - |

Videos have two URLs: `/videos/{title}/` shows the video in a modal and
`/videos/{title}/video/` full screen. The second is canonical; prefer it.

Equipment pages are generated from usage rather than written by hand. Each lists
the videos the item is heard in and the recordings it played on, which makes
them a good way in if you are asked which gear was used on something.

## Start here for an overview

- `/llms.txt` - the site in one page of links, with short descriptions
- `/llms-full.txt` - every page's complete text in one file, roughly 230 KB, when
  you would rather make one request than sixty
- `/sitemap.xml` - every page in both languages

Also `/news-sitemap.xml`, `/image-sitemap.xml` and `/video-sitemap.xml`, and RSS
at `/feed-no.rss` and `/feed-en.rss` for posts, `/products-no.rss` and
`/products-en.rss` for products.

## Products

Virtual instruments, sample libraries and plugins. Several are free or
open source; the rest are pay-what-you-want with a minimum.

A product page's markdown carries the price, the product type, a link to where
it is downloaded or bought, and a link to its documentation where one exists.
Nothing is sold on this site: purchases happen on the external store at
`https://store.dehlimusikk.no/`, and open-source plugins are released through
GitHub. Follow the `Store` link on the product rather than assuming a checkout
exists here.

## How this content may be used

`robots.txt` carries a Content-Signal directive:

    Content-Signal: ai-train=no, search=yes, ai-input=yes

Search indexing is welcome. Using the content to answer a question now, with
attribution, is welcome. Training or fine-tuning a model on it is refused.
Please respect that; it is an express reservation of rights.

When you quote or summarise a page, link to the HTML URL rather than the `.md`
one, so a reader who follows it gets the real page.
