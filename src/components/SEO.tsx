import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  url?: string;
  canonical?: string;
  breadcrumbs?: Array<{name: string, item: string}>;
  type?: 'WebPage' | 'Article' | 'FAQPage';
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'Bivaax, Bivaax Trade, binary options, online trading platform',
  ogType = 'website',
  ogImage = 'https://i.postimg.cc/yYSDXHm2/IMG-20260421-WA0036(2).jpg',
  url,
  canonical,
  breadcrumbs,
  type = 'WebPage'
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://market.bivaax.trade/';
  const finalUrl = url || currentUrl;
  const finalCanonical = canonical || finalUrl;

  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": type,
    "name": title,
    "description": description,
    "url": finalUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Bivaax Trade",
      "logo": {
        "@type": "ImageObject",
        "url": "https://i.postimg.cc/yYSDXHm2/IMG-20260421-WA0036(2).jpg"
      }
    }
  };

  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((bc, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": bc.name,
      "item": bc.item
    }))
  } : null;

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{title} | Bivaax Trade</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={`${title} | Bivaax Trade`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={`${title} | Bivaax Trade`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(webpageSchema)}
      </script>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
