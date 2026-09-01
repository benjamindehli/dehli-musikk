# Markdown negotiation Worker

Serves the markdown twin of a page to clients that send `Accept: text/markdown`,
and the HTML page to everybody else.

## Why a Worker

Firebase Hosting, the origin, matches only on URL path. Its `headers`,
`redirects` and `rewrites` have no condition that reads a request header, so it
cannot vary a response on `Accept`. The alternative was a Cloud Function behind a
catch-all rewrite, which needs the Blaze plan and puts a function in front of
every page request, costing the CDN caching the site gets for free today.

The Worker inverts that: normal traffic passes through untouched, and only a
request that actually asks for markdown does anything different.

## How it works

The build publishes a markdown twin beside every page, at `index.md`
(`/en/products/subc/` → `/en/products/subc/index.md`; see
`src/helpers/markdownHelpers.js`). This Worker generates nothing. It decides
which of two already-published files to return:

1. Non-`GET`/`HEAD` requests pass straight through.
2. `Accept` is parsed with RFC 9110 specificity rules. Markdown wins only if it
   scores strictly higher than `text/html`, so a tie, a missing header or `*/*`
   all keep serving HTML.
3. Only paths ending in `/` are pages, which excludes assets, feeds, sitemaps and
   the `.md` files themselves.
4. If the twin does not exist (the search page and the error pages are HTML
   only), it falls back to the page.
5. `Vary: Accept` is set on both branches. `Content-Location` names the twin on
   the markdown branch.

Anything thrown inside the handler falls back to the origin, so a bug here
degrades to "no markdown variant" rather than taking the site down.

## Route scope and cost

The route is `www.dehlimusikk.no/*`, so the Worker is invoked for every request
to the site, images and fonts included. Workers run in front of the cache, so a
cached asset still counts as an invocation. On a page with many images that adds
up faster than page views do.

This is deliberate: a catch-all route can never silently miss a new section,
whereas a list of page prefixes would have to be updated whenever one is added,
and forgetting would quietly disable negotiation for it. If invocation volume
becomes a problem, the routes can be narrowed to the page prefixes
(`/`, `/posts/*`, `/products/*`, `/videos/*`, `/portfolio/*`, `/equipment/*`,
`/frequently-asked-questions/*`, `/search/*`, `/en/*`), which excludes `/_next/*`,
`/data/*`, `/images/*` and `/fonts/*`. Treat that as a maintenance cost traded
for a smaller bill.

## Requirements

`dehlimusikk.no` must be a zone on the Cloudflare account the Worker deploys to,
with the `www` record **proxied**. On a DNS-only record the route never fires and
the Worker is simply never invoked.

## Deploying

CI deploys it on release, after the Firebase hosting deploy, but only when the
`CLOUDFLARE_API_TOKEN` repository secret exists.

The token needs exactly two permissions, and no more, because the account and
zone ids are pinned in `wrangler.jsonc` rather than looked up by name:

- **Account** → **Workers Scripts** → **Edit**
- **Zone** → **Workers Routes** → **Edit**, with Zone Resources limited to
  `dehlimusikk.no`

No DNS permission is involved.

Manually:

```
yarn worker:deploy
```

## Testing

```
yarn worker:test     # 15 cases, no network needed
yarn worker:dev      # local runtime, proxying to the real origin
```

The tests cover the negotiation rules and the request flow against a stubbed
origin. They cannot cover the deployment, so after deploying check the real
thing:

```
# markdown
curl -sSI -H 'Accept: text/markdown' https://www.dehlimusikk.no/en/products/subc/

# HTML, because a browser rates text/html above the wildcard that matches markdown
curl -sSI -H 'Accept: text/html,application/xhtml+xml,*/*;q=0.8' https://www.dehlimusikk.no/en/products/subc/

# HTML, because a tie goes to HTML
curl -sSI https://www.dehlimusikk.no/en/products/subc/

# HTML, because this page has no twin
curl -sSI -H 'Accept: text/markdown' https://www.dehlimusikk.no/search/
```

The first should answer `content-type: text/markdown; charset=utf-8` with a
`content-location` header; the rest `content-type: text/html`. All four should
carry `vary: accept`.
