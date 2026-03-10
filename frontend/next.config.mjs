/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow image optimizer to fetch from the backend uploads (Render) and other whitelisted hosts.
    dangerouslyAllowLocalIP: true,
    domains: ['jinubifyyy-2.onrender.com'],
    remotePatterns: [
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
    ],
  },
};

export default nextConfig;

