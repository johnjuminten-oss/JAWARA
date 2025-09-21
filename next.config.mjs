/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We want to catch errors during build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // We want to catch type errors during build
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost', 'supabase.co'],
    // Enable image optimization
    unoptimized: false,
  },
  // Enable strict mode for better error catching
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  }
}

export default nextConfig
