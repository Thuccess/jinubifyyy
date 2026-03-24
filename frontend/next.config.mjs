/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16+ always uses SWC for minification; `swcMinify` was removed.
  onDemandEntries: {
    // Keep more recently visited pages in memory in dev so route switches
    // don't trigger frequent cold recompiles.
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 10,
  },
  images: {
    // Allow image optimizer to fetch from the backend uploads (Render) and other whitelisted hosts.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // Local backend uploads (development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
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

