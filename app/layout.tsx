import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { DocumentLanguage } from '@/components/shared/document-language'
import { getSiteOrigin } from '@/lib/seo'
import './globals.css'
import './memberships.css'
import './visuals.css'
import './evidence.css'
import './standard.css'
import './pearl.css'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: 'TAMV Online Network — Investigación, tecnología y memoria viva',
    template: '%s | TAMV Online Network',
  },
  description:
    'Iniciativa mexicana independiente de investigación, tecnología y memoria territorial. Conocimiento con contexto, tecnología con responsabilidad.',
  applicationName: 'TAMV Online Network',
  generator: 'Next.js',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'TAMV Online Network',
    title: 'TAMV Online Network — El futuro digital necesita raíces',
    description:
      'Investigación, tecnología y memoria territorial desde México y Latinoamérica.',
    images: [{ url: '/tamv-official.jpg', alt: 'Logotipo oficial de TAMV Online Network' }],
  },
  twitter: {
    card: 'summary',
    title: 'TAMV Online Network',
    description: 'Investigación, tecnología y memoria territorial desde México.',
  },
  icons: {
    icon: [{ url: '/tamv-official.jpg', type: 'image/jpeg' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FDFCFA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <Suspense fallback={null}><DocumentLanguage /></Suspense>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  )
}
