/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['uuid'],
  },
  generateBuildId: async () => {
    // Use timestamp instead of crypto.randomUUID to avoid build errors
    return `build-${Date.now()}`;
  },
}

module.exports = nextConfig
