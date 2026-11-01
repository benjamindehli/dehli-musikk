# Admin dashboard

A local editor for the site's content. It replaces the old standalone React authoring app.

```bash
yarn admin
```

Then open http://127.0.0.1:3100/.

- It saves straight to `src/data` (and later `public/data`) in this checkout. Review the result with `git diff` and commit as usual. Nothing here deploys anything.
- It only runs as `next dev`, bound to 127.0.0.1. `next.config.mjs` refuses `next build`, `next start` and any run with `CI` set, so it cannot end up on a server.
- It is not part of the site. The site is a static export built from `src/app`. The root `tsconfig.json` excludes `admin/`, and nothing under `admin/` reaches `out/` or Firebase.
- It has no dependencies of its own. Next.js, React, TypeScript and sharp come from the repo root.

Typecheck it with `yarn admin:typecheck`. The root `yarn typecheck` does not cover it.
