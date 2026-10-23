/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  // Proxy semua request /api/v1/* ke backend Fastify agar tidak 404
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/admin/psikolog-web',
        destination: '/psikolog-web/beranda',
        permanent: true,
      },
      {
        source: '/admin/psikolog-web/jadwal',
        destination: '/psikolog-web/jadwal',
        permanent: true,
      },
      {
        source: '/admin/psikolog-web/profile',
        destination: '/psikolog-web/profile',
        permanent: true,
      },
      {
        source: '/admin/psikolog-web/profil',
        destination: '/psikolog-web/profil',
        permanent: true,
      },
      {
        source: '/beranda',
        destination: '/psikolog-web/beranda',
        permanent: true,
      },
      {
        source: '/jadwal',
        destination: '/psikolog-web/jadwal',
        permanent: true,
      },
      {
        source: '/profil',
        destination: '/psikolog-web/profile',
        permanent: true,
      },
      {
        source: '/psikolog/beranda',
        destination: '/psikolog-web/beranda',
        permanent: true,
      },
      {
        source: '/psikolog/jadwal',
        destination: '/psikolog-web/jadwal',
        permanent: true,
      },
      {
        source: '/psikolog/profile',
        destination: '/psikolog-web/profile',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig

