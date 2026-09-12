import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

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
