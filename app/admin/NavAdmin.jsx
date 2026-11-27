'use client'

// Liens de la barre laterale ; le lien de la page courante est marque aria-current="page".
import Link from 'next/link'
import {usePathname} from 'next/navigation'

export const GROUPES = [
    {
        titre: 'Site public · CV',
        liens: [
            ['/admin/organisation', 'Organisation de l’accueil'],
            ['/admin/profil', 'Profil'],
            ['/admin/experiences', 'Expériences'],
            ['/admin/formations', 'Formations'],
            ['/admin/projets', 'Projets du CV'],
            ['/admin/competences', 'Compétences'],
            ['/admin/certifications', 'Certifications'],
        ],
    },
    {
        titre: 'Parcours privé',
        liens: [
            ['/admin/noeuds', 'Nœuds'],
            ['/admin/journal', 'Journal'],
            ['/parcours', 'Voir la carte'],
        ],
    },
]

export default function NavAdmin() {
    const chemin = usePathname()
    const actif = href => (href === '/admin' ? chemin === '/admin' : chemin === href || chemin.startsWith(`${href}/`))
    return (
        <nav aria-label="Administration">
            <ul style={{listStyle: 'none', margin: '0 0 20px', padding: 0}}>
                <li><Link className="admin-lien" href="/admin" aria-current={actif('/admin') ? 'page' : undefined}>Tableau de bord</Link></li>
            </ul>
            {GROUPES.map(g => (
                <section key={g.titre} className="admin-groupe" style={{marginBottom: 20}}>
                    <h2>{g.titre}</h2>
                    <ul>
                        {g.liens.map(([href, libelle]) => (
                            <li key={href}>
                                <Link className="admin-lien" href={href} aria-current={actif(href) ? 'page' : undefined}>{libelle}</Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </nav>
    )
}
