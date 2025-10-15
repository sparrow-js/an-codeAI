import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    // 完全禁用 ESLint 检查
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.trickle.so',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default nextConfig
