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

## The apex robots.txt

One unrelated job rides along, on its own narrow route (`dehlimusikk.no/robots.txt`).

The apex is a Firebase Hosting custom domain set to redirect to www, which is
right for pages and wrong for `robots.txt`. That is a per-origin resource, and
Firebase serves the redirect itself as `Content-Type: text/plain` with a 52-byte
body reading `Redirecting to https://www.dehlimusikk.no/robots.txt`. A client
that reads the body rather than following the hop sees a well-formed
`robots.txt` that happens to contain no rules, and therefore no Content-Signal
directives. RFC 9309 says crawlers should follow up to five redirects for
`robots.txt`, but the ones that do not fail silently.

The Worker answers that one path with the real file fetched from www. Every
other apex URL keeps redirecting exactly as before.

## The MCP server

`src/mcp.js` serves a Model Context Protocol server over Streamable HTTP at
`/mcp`, with its card at `/.well-known/mcp/server-card.json`. Both are answered
by the Worker rather than the origin, so the card and the server it describes
can never be deployed apart from each other.

Three read-only tools: `search`, `read_page`, `list_sections`. Stateless, so
there are no sessions; the site is static, so nothing writes.

Search reads `/llms-full.txt` rather than the JSON behind the site's own search
box. That file already carries every item's title, URL and full text, so the
Worker never derives a slug — a second copy of `convertToUrlFriendlyString` at
the edge would 404 every search result the day it drifted from the build's. The
cost of that choice: `llms-full.txt` is English only and omits equipment, so
search covers products, posts, videos, releases and the FAQ, in English.
`read_page` has no such limit and serves either language.

Point a client at `https://www.dehlimusikk.no/mcp`, or try it by hand:

```
curl -s https://www.dehlimusikk.no/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

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

Wrangler's major version is pinned to 4 in both the workflow and the `worker:*`
scripts. `wrangler.jsonc` needs 3.91 or newer to be read at all, and an
unpinned install is one breaking major away from a failing release.

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
