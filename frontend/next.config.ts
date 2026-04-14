import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    // Required for snarkjs to load .wasm files (ZK circuit) in the browser
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // SnarkJS expects Node.js built-ins, but we are compiling for the browser
    // This tells Webpack to ignore 'fs' and 'crypto' instead of crashing the build
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            os: false,
            crypto: false,
            readline: false,
            events: false,
        };
    }

    return config;
  },
};

export default nextConfig;
