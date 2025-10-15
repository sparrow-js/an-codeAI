import { NextResponse } from 'next/server';

const siteUrl = 'https://needware.dev';

export async function GET() {
  const currentDate = new Date().toISOString();
  
  // Define your static pages
  const staticPages = [
    {
      url: '',
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: '/login',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: '/pricing',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: '/privacy-policy',
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: '/terms',
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
