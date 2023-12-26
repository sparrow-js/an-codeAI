const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const { patchWebpackConfig } = require("next-global-css");

const rewrites = async () => {
  const ret = [];

  return {
      beforeFiles: ret,
  };
};
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
      ignoreDuringBuilds: true,
  },
  rewrites,
  typescript: {
      ignoreBuildErrors: true,
  },
  publicRuntimeConfig: {
      apiPath: '/api/',
      backendOrigin: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  webpack: (config, options) => {

    // allow global CSS to be imported from within node_modules
    // see also:
    //   - https://nextjs.org/docs/messages/css-npm
    //   - https://github.com/vercel/next.js/discussions/27953
    patchWebpackConfig(config, options);

    config.module.rules.push({ test: /\.ttf$/, type: "asset/resource" });

    // when `isServer` is `true`, building (`next build`) fails with the following error:
    // "Conflict: Multiple assets emit different content to the same filename ../main.js.nft.json"
    if (!options.isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["javascript", "typescript"],
          filename: "static/[name].worker.js",
        })
      );
    }

    return config;
  },
}

module.exports = nextConfig
