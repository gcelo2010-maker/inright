import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Force all pages to be dynamically rendered - no static prerendering
  // This prevents build-time Supabase client initialization errors
  experimental: {
    ppr: false,
  },
}

export default nextConfig
