const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wilfriedbemelingue.vercel.app'

export default function robots() {
    return {
        rules: [
            // Claude-User : recuperation a la demande d'un utilisateur (pas un crawler d'indexation),
            // autorise partout, y compris /ml-map ; /admin reste exclu pour tous.
            {userAgent: 'Claude-User', allow: '/', disallow: '/admin'},
            {userAgent: '*', allow: '/', disallow: ['/ml-map', '/admin']},
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
