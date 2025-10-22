import { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/klijent/',
        '/pruzatelj/',
        '/_next/',
        '/private/',
      ],
    },
    sitemap: `${seoConfig.url}/sitemap.xml`,
    host: seoConfig.url,
  };
}
