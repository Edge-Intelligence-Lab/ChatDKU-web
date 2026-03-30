import type { NextConfig } from "next";

const isDevMode = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Server mode required for API routes (JWT proxy)
  trailingSlash: true,
  
  // Images configuration
  images: {
    unoptimized: true,
  },
  
  // Add rewrites for development mode to proxy API calls.
  // Using `fallback` ensures local Route Handlers (including dynamic ones like
  // /api/c/[sessionId]/messages) are always checked first. The production server
  // is only contacted when no local handler matches.
  ...(isDevMode && {
    async rewrites() {
      return {
        beforeFiles: [],
        afterFiles: [],
        fallback: [
          {
            source: '/api/:path*',
            destination: 'https://chatdku.dukekunshan.edu.cn/api/:path*',
          },
          {
            source: '/dev/:path*',
            destination: 'https://chatdku.dukekunshan.edu.cn/dev/:path*',
          },
        ],
      };
    },
  }),
};

export default nextConfig;
