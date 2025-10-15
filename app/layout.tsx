import type { Metadata } from 'next'
import './globals.css'
import '@/styles/index.scss?url';
import { Toaster } from '@/components/shadui/toaster';
import { GoogleTagManager } from '@next/third-parties/google'


const siteUrl = 'https://needware.dev';

export const metadata: Metadata = {
  title: {
    default: 'needware - AI-Powered Software Development Platform',
    template: '%s | needware'
  },
  description: 'Build complete software products using only natural language. needware is an AI-powered platform that transforms your ideas into production-ready applications through intelligent chat interface.',
  keywords: [
    'needware',
    'AI software development', 
    'no-code platform',
    'AI website builder',
    'automated coding',
    'AI full stack development',
    'chat-based development',
    'AI code generation',
    'software automation',
    'intelligent development platform',
    'AI engineer',
    'automated web development',
    'no-code AI builder',
    'conversational programming'
  ],
  authors: [{ name: 'needware Team' }],
  creator: 'needware',
  publisher: 'needware',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'needware',
    title: 'needware - AI-Powered Software Development Platform',
    description: 'Build complete software products using only natural language. Transform your ideas into production-ready applications with AI.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'needware - AI-Powered Software Development Platform',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'needware - AI-Powered Software Development Platform',
    description: 'Build complete software products using only natural language. Transform your ideas into production-ready applications with AI.',
    images: ['/og-image.png'],
    creator: '@needware',
    site: '@needware',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'Technology',
  classification: 'Software Development Platform',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="en"
      suppressHydrationWarning
      className='dark'
    >
      <GoogleTagManager gtmId="G-NWWZPPCQL9" />
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="needware" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "needware",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "description": "AI-powered software development platform that transforms natural language into production-ready applications",
              "url": siteUrl,
              "author": {
                "@type": "Organization",
                "name": "needware Team"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "AI-powered code generation",
                "Natural language programming",
                "Full-stack development automation",
                "Real-time collaboration",
                "One-click deployment"
              ]
            })
          }}
        />
      </head>
      <body
        className={`antialiased w-full h-full`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
