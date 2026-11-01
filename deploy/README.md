# Deploy tools

The two CLIs the release workflow deploys with: `firebase-tools` for Hosting and
`wrangler` for the edge Worker. They live here, with their own lockfile, rather
than being fetched by `npx` at deploy time.

## Why

The deploy job is the only job that holds the deploy tokens. `npx` pinned only
the top-level package: firebase-tools declares most of its own dependencies as
ranges and ships no shrinkwrap, so every release resolved its roughly 650
packages afresh, and a malicious release of any one of them that day would have
run with `FIREBASE_TOKEN` in reach. `package-lock.json` fixes every version and
its integrity hash, and the workflow installs with `npm ci --ignore-scripts`, so
nothing in the tree runs code at install time either.

Not in the root `package.json`, because the build job and every pull request
would then install all of it too, and the build job is where untrusted code
(dependency install scripts, pull request changes) is allowed to run.

## Updating

Dependabot opens a pull request for this folder monthly. By hand:

```bash
cd deploy
npm install --ignore-scripts firebase-tools@<version> wrangler@<version> --save-exact
```

Commit `package.json` and `package-lock.json` together. Both CLIs were checked to
work without their install scripts (`esbuild`, `workerd`, `protobufjs` and the
optional `re2` and `fsevents` have them); if a future version stops working that
way, the release fails at the deploy step rather than deploying anything wrong.
