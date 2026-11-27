import './admin.css'
import Link from 'next/link'
import {sessionValide} from '../../src/lib/admin/garde'
import {seDeconnecter} from './actions'
import NavAdmin from './NavAdmin'

// Espace prive : jamais indexe, jamais mis en cache, rendu a chaque requete.
export const metadata = {
    title: 'Administration',
    robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false}},
}
export const dynamic = 'force-dynamic'

// Contenu de la barre laterale ; "Conteneur" : <aside> sur grand ecran, <div> dans le menu mobile.
function Laterale({Conteneur = 'div', ...props}) {
    return (
        <Conteneur className="admin-laterale" {...props}>
            <div className="admin-marque">Administration<small>Portfolio</small></div>
            <NavAdmin/>
            <div className="admin-pied">
                <Link className="admin-lien" href="/" target="_blank" rel="noreferrer">Voir le site ↗</Link>
                <form action={seDeconnecter}>
                    <button type="submit">Se déconnecter</button>
                </form>
            </div>
        </Conteneur>
    )
}

export default async function AdminLayout({children}) {
    const connecte = await sessionValide()
    if (!connecte) {
        return <div className="admin"><main className="admin-contenu" style={{margin: '0 auto'}}>{children}</main></div>
    }
    return (
        <div className="admin">
            {/* Mobile : barre laterale repliee dans un menu (sans JavaScript). */}
            <details className="admin-menu-mobile">
                <summary><span className="admin-marque">Administration</span></summary>
                <Laterale/>
            </details>
            <div className="admin-cadre">
                <Laterale Conteneur="aside" aria-label="Navigation de l’administration"/>
                <main className="admin-contenu">{children}</main>
            </div>
        </div>
    )
}
