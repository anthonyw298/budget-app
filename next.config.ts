import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for Vercel + Supabase
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default nextConfig
