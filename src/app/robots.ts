import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard/'],
      },
    ],
    sitemap: 'https://suchakree-panyawong.vercel.app/sitemap.xml',
  };
}
