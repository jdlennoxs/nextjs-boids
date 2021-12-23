/** @type {import('next').NextConfig} */
const deps = require("./package.json").dependencies;

module.exports = {
  reactStrictMode: true,
  webpack: (config, options) => {
    const { ModuleFederationPlugin } = options.webpack.container;
    config.plugins.push(
      new ModuleFederationPlugin({
        name: "boids",
        filename: "remoteEntry.js",
        exposes: {
          "./Flock": "./pages/main",
        },
        shared: [
          {
            ...deps,
            react: {
              singleton: true,
              requiredVersion: deps["react"],
            },
            "react-dom": {
              eager: true,
              requiredVersion: deps["react-dom"],
            },
          },
        ],
      })
    );

    return config;
  },
};
