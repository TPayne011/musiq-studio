/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // IMPORTANT: do NOT include experimental: { allowedDevOrigins } here
};
module.exports = nextConfig;
