import { createRequire } from "node:module";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/*
 * The React version is read rather than written down, because the only thing
 * worse than no version here is one that quietly stops matching the installed
 * React. See the settings block below for why it has to be stated at all.
 */
const reactVersion = createRequire(import.meta.url)("react/package.json").version;

/*
 * Flat config, because Next 16 removed `next lint` and no longer lints during
 * `next build`. Linting is its own step now: `yarn lint`, and the Validate
 * workflow runs it on every push.
 *
 * Both presets are needed. core-web-vitals alone leaves the @typescript-eslint
 * rules unregistered, which quietly costs unused-variable detection in .ts and
 * .tsx - the files this repo is steadily converting to.
 */
const config = [
    {
        ignores: [
            ".next/**",
            // The static export. 1437 pages of generated HTML and bundled JS,
            // none of it ours to lint.
            "out/**",
            "node_modules/**",
            "public/**",
            "temp/**",
            "next-env.d.ts"
        ]
    },
    ...nextCoreWebVitals,
    ...nextTypeScript,
    {
        /*
         * Must come after the presets, which set react.version to "detect".
         *
         * Under ESLint 10 that setting is not merely slow, it is fatal: every
         * React rule fails to load with "contextOrFilename.getFilename is not a
         * function". ESLint 10 removed context.getFilename(), deprecated since
         * 9, and eslint-plugin-react 7.37.5 still calls it - but only from the
         * filesystem walk that "detect" triggers. Naming the version skips that
         * path entirely, so the whole plugin works again.
         *
         * This is a workaround for a dependency, not a preference. The upstream
         * fix is on eslint-plugin-react master but unreleased
         * (jsx-eslint/eslint-plugin-react#3977), and eslint-config-next pins
         * ^7.37.0, so a plain `yarn up` will pick it up whenever it ships. At
         * that point this block becomes optional - though it is still worth
         * keeping, because detection costs a stat walk per rule per file.
         */
        settings: {
            react: { version: reactVersion }
        }
    },
    {
        rules: {
            /*
             * The site is `output: "export"` with `images.unoptimized`, so
             * next/image would ship a component that cannot optimise anything.
             * The thumbnails are hand-built <picture> elements instead, each
             * serving avif, webp and jpeg at five widths with explicit
             * dimensions - which is what this rule is trying to get you to do.
             * All 37 <img> elements here are that, so the rule is pure noise.
             */
            "@next/next/no-img-element": "off"
        }
    },
    {
        /*
         * Build and verification scripts, and the Cloudflare Worker. Plain
         * Node/Workers modules with no React in them, so the React and
         * accessibility rules have nothing to say about them.
         */
        files: ["scripts/**/*.mjs", "worker/**/*.mjs", "worker/**/*.js"],
        rules: {
            "@next/next/no-assign-module-variable": "off"
        }
    }
];

export default config;
