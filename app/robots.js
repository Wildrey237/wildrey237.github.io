const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wilfriedbemelingue.vercel.app'

export default function robots() {
    return {
        rules: [
            // /admin : prive, exclu pour tous les robots. /parcours n'est PAS exclu ici : il porte
            // noindex (meta + en-tete X-Robots-Tag), que les robots ne verraient pas s'ils ne
            // pouvaient pas lire la page. /ml-map redirige vers /parcours.
            {userAgent: 'Claude-User', allow: '/', disallow: ['/admin', '/ml-map']},
            {userAgent: '*', allow: '/', disallow: ['/admin', '/ml-map']},
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
