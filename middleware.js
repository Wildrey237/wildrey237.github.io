import {NextResponse} from 'next/server'
import {COOKIE_SESSION, jetonValide} from './src/lib/admin/session'

// Protection de /admin : toute page (et toute action serveur, postee sur l'URL de la page) exige
// un cookie de session valide, sauf la page de connexion. /parcours est public en lecture
// (son edition passe par /api/parcours/etat, qui verifie la session lui-meme).
// Sans ADMIN_PASSWORD configuree, l'acces est refuse (echec ferme).
export async function middleware(requete) {
    const {pathname} = requete.nextUrl

    // Page de connexion et sa route de validation : accessibles sans session.
    if (pathname !== '/admin/connexion' && pathname !== '/admin/connexion/valider') {
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
    matcher: ['/admin', '/admin/:path*'],
}
