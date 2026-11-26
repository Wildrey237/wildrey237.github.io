import Link from 'next/link'
import './admin.css'
import {sessionValide} from '../../src/lib/admin/garde'
import {seDeconnecter} from './actions'

// Espace prive : jamais indexe, jamais mis en cache, rendu a chaque requete.
export const metadata = {
    title: 'Administration',
    robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false}},
}
export const dynamic = 'force-dynamic'

export default async function AdminLayout({children}) {
    const connecte = await sessionValide()
    return (
        <div className="admin">
            {connecte && (
                <header className="admin-entete">
                    <strong>Admin</strong>
                    <nav>
                        <Link href="/admin">Tableau de bord</Link>
                        <Link href="/admin/noeuds">Noeuds</Link>
                        <Link href="/admin/journal">Journal</Link>
                        <Link href="/admin/projets">Projets</Link>
                        <Link href="/admin/competences">Competences</Link>
                        <Link href="/" target="_blank" rel="noreferrer">Voir le site</Link>
                    </nav>
                    <form action={seDeconnecter}>
                        <button type="submit" className="secondaire">Se deconnecter</button>
                    </form>
                </header>
            )}
            <main className="admin-contenu">{children}</main>
        </div>
    )
}
