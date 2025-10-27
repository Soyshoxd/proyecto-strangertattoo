import "./globals.css";
import { Toaster } from "sonner";
import { CacheSyncProvider } from "@/components/cache-sync-provider";

export const metadata = {
  metadataBase: new URL('https://stranger-tattoo.com'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },

  title: {
    default: 'Stranger Tattoo - Productos para Tatuajes y Piercings | Chía, Colombia',
    template: '%s | Stranger Tattoo'
  },
  description: 'Tu tienda especializada en productos para tatuajes, piercings, vapes y accesorios de calidad profesional en Chía, Colombia. Envíos a toda Colombia.',
  keywords: 'tatuajes chía, piercing chía, productos tattoo colombia, tintas tatuaje, agujas tattoo, vapes colombia, joyería corporal, stranger tattoo chía',
  authors: [{ name: 'Stranger Tattoo' }],
  creator: 'Stranger Tattoo',
  publisher: 'Stranger Tattoo',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://stranger-tattoo.com',
    siteName: 'Stranger Tattoo',
    title: 'Stranger Tattoo - Productos para Tatuajes y Piercings | Chía, Colombia',
    description: 'Tu tienda especializada en productos para tatuajes, piercings, vapes y accesorios de calidad profesional en Chía, Colombia.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stranger Tattoo - Productos profesionales para tatuajes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stranger Tattoo - Productos para Tatuajes y Piercings',
    description: 'Tu tienda especializada en productos para tatuajes, piercings, vapes y accesorios de calidad profesional.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code', // Agregar código real
  },
  alternates: {
    canonical: 'https://stranger-tattoo.com',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ba0000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebase.googleapis.com" />

        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-monserrat text-gray-100 bg-black antialiased">
        <Toaster richColors position="top-center" />
        <CacheSyncProvider>
          {children}
        </CacheSyncProvider>
      </body>
    </html>
  );
}
