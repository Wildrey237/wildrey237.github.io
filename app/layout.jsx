import {Providers} from './providers'
import {GoogleAnalytics} from '@next/third-parties/google'
import {Analytics} from '@vercel/analytics/react'
import {SpeedInsights} from '@vercel/speed-insights/next'
import '../src/index.css'
import '../src/App.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wilfriedbemelingue.vercel.app'
const GA_ID = 'G-QSFT7C8DBJ'

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'BEMELINGUE DJOSSIE Wilfried Ryan — Ingénieur IA & Data | EPITA',
    description:
        "Portfolio de BEMELINGUE DJOSSIE Wilfried Ryan (Wilfried Bemelingue) — Étudiant ingénieur EPITA spécialisé en IA, Deep Learning, Graph Neural Networks et Data Engineering. En recherche de stage de fin d'études.",
    authors: [{name: 'BEMELINGUE DJOSSIE Wilfried Ryan'}],
    keywords: [
        'BEMELINGUE DJOSSIE Wilfried Ryan', 'Wilfried Ryan Bemelingue Djossie',
        'Wilfried Bemelingue', 'Bemelingue Djossie', 'Wilfried Ryan Bemelingue',
        'EPITA', 'IA', 'Intelligence Artificielle', 'Machine Learning',
        'Deep Learning', 'GNN', 'Graph Neural Networks', 'Data Engineering', 'Big Data',
        'MLOps', 'Stage ingénieur', 'Île-de-France',
    ],
    manifest: '/manifest.json',
    verification: {
        google: 'ouA2XHGZu9XPY2DuxwNqpEfxagKP-NhJbuhcwkk8tKI',
    },
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/icon.svg',
        shortcut: '/favicon.ico',
    },
    openGraph: {
        type: 'website',
        title: 'BEMELINGUE DJOSSIE Wilfried Ryan — Ingénieur IA & Data',
        description:
            'BEMELINGUE DJOSSIE Wilfried Ryan — Étudiant ingénieur EPITA spécialisé en IA, Deep Learning et Data Engineering. Découvrez mon parcours, mes projets et mes expériences.',
        url: SITE_URL,
        siteName: 'Portfolio BEMELINGUE DJOSSIE Wilfried Ryan',
        images: [{url: '/profile_picture.jpg', width: 1200, height: 630}],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BEMELINGUE DJOSSIE Wilfried Ryan — Ingénieur IA & Data',
        description: 'BEMELINGUE DJOSSIE Wilfried Ryan — Étudiant ingénieur EPITA spécialisé en IA, Deep Learning et Data Engineering.',
        images: ['/profile_picture.jpg'],
    },
}

export const viewport = {
    themeColor: '#0b0d14',
    width: 'device-width',
    initialScale: 1,
}

const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'BEMELINGUE DJOSSIE Wilfried Ryan',
    alternateName: [
        'Wilfried Bemelingue',
        'Wilfried Ryan Bemelingue Djossie',
        'Wilfried Ryan Bemelingue',
        'Bemelingue Djossie Wilfried Ryan',
    ],
    givenName: 'Wilfried Ryan',
    familyName: 'Bemelingue Djossie',
    url: SITE_URL,
    image: `${SITE_URL}/profile_picture.jpg`,
    jobTitle: 'Ingénieur IA — Deep Learning & Data Engineering',
    description:
        "Étudiant ingénieur EPITA spécialisé en IA, Deep Learning, Graph Neural Networks et Data Engineering. En recherche de stage de fin d'études.",
    email: 'mailto:wilfriedbemelingue@gmail.com',
    alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'EPITA — École d\'Ingénieurs en Intelligence Informatique',
    },
    address: {
        '@type': 'PostalAddress',
        addressRegion: 'Île-de-France',
        addressCountry: 'FR',
    },
    knowsAbout: [
        'Intelligence Artificielle', 'Deep Learning', 'Graph Neural Networks',
        'Machine Learning', 'Data Engineering', 'MLOps', 'Big Data',
    ],
    sameAs: [
        'https://www.linkedin.com/in/wilfried-bemelingue',
        'https://github.com/Wildrey237',
    ],
}

export default function RootLayout({children}) {
    return (
        <html lang="fr" suppressHydrationWarning>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
            <link
                href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
                rel="stylesheet"/>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(personJsonLd)}}
            />
        </head>
        <body suppressHydrationWarning>
        <noscript>Vous devez activer JavaScript pour voir ce site.</noscript>
        <Providers>{children}</Providers>
        <Analytics/>
        <SpeedInsights/>
        <GoogleAnalytics gaId={GA_ID}/>
        </body>
        </html>
    )
}
