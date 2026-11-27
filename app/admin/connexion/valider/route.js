// Connexion a l'espace prive : formulaire HTML classique (POST) -> cookie de session -> 303.
// La navigation est faite par le navigateur (avec ou sans JavaScript), sans passer par le
// routeur client de Next : pas de rendu interne de la page de destination.
import {NextResponse} from 'next/server'
import {COOKIE_SESSION, DUREE_SESSION, creerJeton, egaliteSure} from '../../../../src/lib/admin/session'

// Destination autorisee apres connexion : /admin ou /parcours uniquement (pas de redirection ouverte).
function destination(suite) {
    return /^\/(admin|parcours)(\/[\w\-\/]*)?$/.test(suite) && suite !== '/admin/connexion' ? suite : '/admin'
}

export async function POST(requete) {
    const url = new URL(requete.url)
    const vers = chemin => NextResponse.redirect(new URL(chemin, url.origin), 303)

    // Formulaire poste depuis ce site uniquement.
    const origine = requete.headers.get('origin')
    if (origine && origine !== url.origin) return new NextResponse('Origine refusee', {status: 403})

    const form = await requete.formData()
    const motDePasse = String(form.get('motDePasse') ?? '')
    const suite = destination(String(form.get('suite') ?? ''))
    const attendu = process.env.ADMIN_PASSWORD
    if (!attendu) return vers('/admin/connexion?erreur=config')

    if (!motDePasse || !(await egaliteSure(motDePasse, attendu))) {
        // Ralentit les essais en serie.
        await new Promise(r => setTimeout(r, 1000))
        return vers(`/admin/connexion?${new URLSearchParams({erreur: 'motdepasse', suite})}`)
    }

    const reponse = vers(suite)
    reponse.cookies.set(COOKIE_SESSION, await creerJeton(attendu), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: DUREE_SESSION,
    })
    return reponse
}
