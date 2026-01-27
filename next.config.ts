import type { NextConfig } from "next";

const isDevMode = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Only use static export in production
  ...(isDevMode ? {} : { output: 'export' }),
  trailingSlash: true,
  
  // Images configuration
  images: {
    unoptimized: true,
  },
  
  // Add rewrites for development mode to proxy API calls
  ...(isDevMode && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://chatdku.dukekunshan.edu.cn/api/:path*',
        },
        {
          source: '/user/:path*',
          destination: 'https://chatdku.dukekunshan.edu.cn/user/:path*',
        },
        {
          source: '/user_files/:path*',
          destination: 'https://chatdku.dukekunshan.edu.cn/user_files/:path*',
        },
        {
          source: '/dev/:path*',
          destination: 'https://chatdku.dukekunshan.edu.cn/dev/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;
