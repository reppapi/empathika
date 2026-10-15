/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
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
        destination: '/psikolog-web/profile',
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
