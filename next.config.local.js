/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilita validação de HTTPS para builds locais
  experimental: {
    skipTrailingSlashRedirect: true,
  },
  // Permite HTTP em desenvolvimento
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
