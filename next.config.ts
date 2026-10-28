import type { NextConfig } from "next";

// Project site: https://tn-ip.github.io/hoktou/
// basePath prefixes routes and Next assets. assetPrefix is the same origin
// path so CSS, JS, and fonts load under /hoktou/ on GitHub Pages.
const basePath = "/hoktou";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
