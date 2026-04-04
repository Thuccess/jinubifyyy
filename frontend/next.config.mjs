/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@headlessui/react', 'recharts'],
  },
  // Next.js 16+ always uses SWC for minification; `swcMinify` was removed.
  onDemandEntries: {
    // Larger buffer in dev reduces evict → recompile → ChunkLoadError(timeout) on slow machines.
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 24,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Prefer direct Cloudinary/CDN URLs in CMS for Africa latency; optimizer cache helps /uploads.
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 480],
    // Allow image optimizer to fetch from the backend uploads (Render) and other whitelisted hosts.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // Local backend (development) — /uploads/** plus any root static files (e.g. team photos)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jinubify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Production backend (Render) – images from API uploads
      {
        protocol: 'https',
        hostname: 'jinubifyyy-2.onrender.com',
        pathname: '/uploads/**',
      },
      // Cloudinary (uploaded images)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

