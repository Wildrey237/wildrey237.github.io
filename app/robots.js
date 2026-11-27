const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wilfriedbemelingue.vercel.app'

export default function robots() {
    return {
        rules: [
            // Espaces prives (admin, parcours) : exclus pour tous les robots, Claude-User compris.
            // /ml-map redirige vers /parcours.
            {userAgent: 'Claude-User', allow: '/', disallow: ['/admin', '/parcours', '/ml-map']},
            {userAgent: '*', allow: '/', disallow: ['/admin', '/parcours', '/ml-map']},
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
