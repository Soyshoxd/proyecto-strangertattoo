'use client';

export default function StructuredData() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Stranger Tattoo",
    "image": "https://stranger-tattoo.com/logo.jpg",
    "description": "Estudio especializado en tatuajes, piercings, vapes y joyería corporal en Chía, Colombia. Artistas profesionales y productos de calidad.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Cra. 9 #14-97", // Reemplazar con dirección real
      "addressLocality": "Chía",
      "addressRegion": "Cundinamarca", 
      "postalCode": "250001", // Reemplazar con código postal real
      "addressCountry": "CO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 4.8632084,
      "longitude": -74.0581534
    },
    "url": "https://stranger-tattoo.com",
    "telephone": "+57-3046724589", // Reemplazar con teléfono real
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "11:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification", 
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "19:00"
      }
    ],
    "priceRange": "$$",
    "servesCuisine": [], // No aplica para tattoo studio
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Stranger Tattoo",
    "url": "https://stranger-tattoo.com",
    "logo": "https://stranger-tattoo.com/logo.jpg",
    "description": "Estudio de tatuajes y piercings profesional en Chía, Colombia",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Chía",
      "addressRegion": "Cundinamarca",
      "addressCountry": "CO"
    },
    "sameAs": [
      "https://www.facebook.com/strangertattoo", // Reemplazar con redes sociales reales
      "https://www.instagram.com/strangertattoochia?igsh=MW80bW9vYTliN3o2cQ==",
      "https://www.tiktok.com/@strangertattoo"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
    </>
  );
}
