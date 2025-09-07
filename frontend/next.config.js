/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'videtopia.net', 'www.videtopia.net'],
  },
}

module.exports = nextConfig
