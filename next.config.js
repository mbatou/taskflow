/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure no static generation settings are conflicting
  output: 'standalone', // or remove this line if not needed
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
