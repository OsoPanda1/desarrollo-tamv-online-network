/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/temas', destination: '/investigacion', permanent: true },
      { source: '/investigacion/temas', destination: '/investigacion', permanent: true },
      { source: '/ecosistema', destination: '/proyectos', permanent: true },
      { source: '/modulos', destination: '/proyectos', permanent: true },
      { source: '/mapa-hcu', destination: '/hcu', permanent: true },
      { source: '/publicaciones', destination: '/investigacion/publicaciones', permanent: true },
      { source: '/propuestas', destination: '/portal/propuestas/nueva', permanent: false },
      { source: '/portal/acceso', destination: '/sign-in', permanent: true },
      { source: '/api/research/topics', destination: '/api/v1/research/topics', permanent: true },
      { source: '/api/research/projects', destination: '/api/v1/research/projects', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://vitals.vercel-insights.com" },
        ],
      },
    ]
  },
}

export default nextConfig
