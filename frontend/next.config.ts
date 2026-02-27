import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        // Allow all HTTPS images (for manufacturer logos, etc.)
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Compression
  compress: true,
  // Production optimizations
  // Production optimizations
  productionBrowserSourceMaps: false,

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

// PWA Configuration
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  scope: '/',
  sw: 'sw.js',
  runtimeCaching: [
    // Products and Categories - Cache First (24 hours)
    {
      urlPattern: /^https?:.*\/(api\/(products|categories|manufacturers|productTypes))/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'api-cache-products',
        expiration: {
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
          maxEntries: 200,
        },
      },
    },
    // User Orders - Network First with fallback
    {
      urlPattern: /^https?:.*\/api\/(orders|admin\/orders)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-orders',
        networkTimeoutSeconds: 3,
        expiration: {
          maxAgeSeconds: 5 * 60, // 5 minutes
          maxEntries: 50,
        },
      },
    },
    // User Profile and Addresses - Stale While Revalidate
    {
      urlPattern: /^https?:.*\/api\/(address|users|profile)/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache-user',
        expiration: {
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
          maxEntries: 100,
        },
      },
    },
    // Images - Cache First
    {
      urlPattern: /^https?:.*\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          maxEntries: 300,
        },
      },
    },
    // Static assets - Cache First
    {
      urlPattern: /^https?:.*\/(static|_next\/static)/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-cache',
        expiration: {
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          maxEntries: 500,
        },
      },
    },
    // HTML pages - Network First
    {
      urlPattern: /^https?:.*\.html$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        networkTimeoutSeconds: 3,
        expiration: {
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
};

export default withPWA(pwaConfig)(withNextIntl(nextConfig));