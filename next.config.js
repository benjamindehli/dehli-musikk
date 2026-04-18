const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    sassOptions: {
        includePaths: [path.join(__dirname, "src")]
    },
    webpack(config) {
        // Handle SVG imports as React components (SVGR)
        const fileLoaderRule = config.module.rules.find((rule) => rule.test?.toString().includes("svg"));
        if (fileLoaderRule) {
            fileLoaderRule.exclude = /\.svg$/i;
        }
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ["@svgr/webpack"]
        });
        return config;
    }
};

module.exports = nextConfig;
