import {Providers} from './providers'
import {GoogleAnalytics} from '@next/third-parties/google'
import {Analytics} from '@vercel/analytics/react'
import '../src/index.css'
import '../src/App.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wildrey237.github.io'
const GA_ID = 'G-QSFT7C8DBJ'

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'Wilfried Bemelingue — Ingénieur IA & Data | EPITA',
    description:
        "Portfolio de Wilfried Bemelingue — Étudiant ingénieur EPITA spécialisé en IA, Deep Learning, Graph Neural Networks et Data Engineering. En recherche de stage de fin d'études.",
    authors: [{name: 'Wilfried Bemelingue'}],
    keywords: [
        'Wilfried Bemelingue', 'EPITA', 'IA', 'Intelligence Artificielle', 'Machine Learning',
        'Deep Learning', 'GNN', 'Graph Neural Networks', 'Data Engineering', 'Big Data',
        'MLOps', 'Stage ingénieur', 'Île-de-France',
    ],
    manifest: '/manifest.json',
    icons: {
        icon: '/icon.svg',
        shortcut: '/favicon.ico',
    },
    openGraph: {
        type: 'website',
        title: 'Wilfried Bemelingue — Ingénieur IA & Data',
        description:
            'Étudiant ingénieur EPITA spécialisé en IA, Deep Learning et Data Engineering. Découvrez mon parcours, mes projets et mes expériences.',
        url: SITE_URL,
        siteName: 'Portfolio Wilfried Bemelingue',
        images: [{url: '/profile_picture.jpg', width: 1200, height: 630}],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Wilfried Bemelingue — Ingénieur IA & Data',
        description: 'Étudiant ingénieur EPITA spécialisé en IA, Deep Learning et Data Engineering.',
        images: ['/profile_picture.jpg'],
    },
}

export const viewport = {
    themeColor: '#0b0d14',
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({children}) {
    return (
        <html lang="fr">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
            <link
                href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
                rel="stylesheet"/>
        </head>
        <body>
        <noscript>Vous devez activer JavaScript pour voir ce site.</noscript>
        <Providers>{children}</Providers>
        <Analytics/>
        <GoogleAnalytics gaId={GA_ID}/>
        </body>
        </html>
    )
}
