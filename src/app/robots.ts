import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://simplifiqueia.com.br'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_debug/',
          '/auth/_debug/',
          '/uploads/',
          '/tmp/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
