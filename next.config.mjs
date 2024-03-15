/** @type {import('next').NextConfig} */
// const nextConfig = {};
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**vision-model-images1.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  //   webpack: (config, { isServer }) => {
  //     // Fixes npm packages that depend on `fs` module
  //     if (!isServer) {
  //       config.resolve.fallback = {
  //         ...config.resolve.fallback,
  //         fs: false,
  //       };
  //     }

  //     return config;
  //   },
};

export default nextConfig;
