export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stranger-tattoo.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/carrito',
        '/listadedeseos',
        '/login',
        '/register',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
