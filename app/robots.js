const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wilfriedbemelingue.vercel.app'

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/ml-map',
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
