import {NextResponse} from 'next/server'
import {COOKIE_SESSION, jetonValide} from './src/lib/admin/session'

// Protection de /admin et du parcours prive (/parcours) : toute page (et toute action serveur,
// postee sur l'URL de la page) exige un cookie de session valide, sauf la page de connexion.
// Sans ADMIN_PASSWORD configuree, l'acces est refuse (echec ferme).
export async function middleware(requete) {
    const {pathname} = requete.nextUrl

    if (pathname !== '/admin/connexion') {
        const valide = await jetonValide(requete.cookies.get(COOKIE_SESSION)?.value, process.env.ADMIN_PASSWORD)
        if (!valide) {
            const url = requete.nextUrl.clone()
            url.pathname = '/admin/connexion'
            url.search = ''
            url.searchParams.set('suite', pathname)
            const reponse = NextResponse.redirect(url)
            reponse.headers.set('X-Robots-Tag', 'noindex, nofollow')
            return reponse
        }
    }

    const reponse = NextResponse.next()
    reponse.headers.set('X-Robots-Tag', 'noindex, nofollow')
    reponse.headers.set('Cache-Control', 'no-store')
    return reponse
}

export const config = {
    matcher: ['/admin', '/admin/:path*', '/parcours', '/parcours/:path*'],
}
