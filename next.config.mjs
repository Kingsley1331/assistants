/** @type {import('next').NextConfig} */
const nextConfig = {};
// const nextConfig = {
//   //   images: {
//   //     remotePatterns: [
//   //       {
//   //         protocol: "https",
//   //         hostname: "**projects.vercel.app",
//   //         port: "",
//   //         pathname: "/**",
//   //       },
//   //     ],
//   //   },
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
// };

export default nextConfig;
