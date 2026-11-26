import PrereqMap from '../../src/components/PrereqMap/PrereqMap'
import {TRACKS, NODES, PROJ} from '../../src/components/PrereqMap/prereqMapData'

// Page hors site : outil personnel, jamais indexee ni liee depuis la navigation principale.
export const metadata = {
    title: 'Carte des prerequis - SCIA-G',
    description: 'Carte interactive des prerequis math, machine learning, graphes, algorithmique et mise en production de la majeure SCIA-G, avec les projets EPITA rattaches a chaque competence.',
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
        },
    },
}

export const viewport = {
    themeColor: '#0d1219',
    width: 'device-width',
    initialScale: 1,
}

export default function SciaPrerequisitesPage() {
    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Geist:wght@400;450;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
                rel="stylesheet"
            />
            <PrereqMap/>
            <MapTextVersion/>
        </>
    )
}

// Version texte de la carte, rendue cote serveur : lisible sans JavaScript
// (lecteurs d'ecran, agents qui recuperent la page). Masquee visuellement par .sr-only.
function MapTextVersion() {
    const titles = Object.fromEntries(NODES.map(n => [n.id, n.t]))
    return (
        <section className="sr-only" aria-label="Version texte de la carte des prerequis">
            <h1>Carte des prerequis - SCIA-G</h1>
            {Object.entries(TRACKS).map(([tk, track]) => (
                <section key={tk}>
                    <h2>{track.label}</h2>
                    <ul>
                        {NODES.filter(n => n.tk === tk).map(n => (
                            <li key={n.id}>
                                <h3>{n.t} <span>({n.id})</span></h3>
                                {n.n?.length > 0 && <p>Notions : {n.n.join(', ')}</p>}
                                {n.p?.length > 0 && (
                                    <p>Prerequis : {n.p.map(id => titles[id] || id).join(', ')}</p>
                                )}
                                {PROJ[n.id]?.length > 0 && (
                                    <ul>
                                        {PROJ[n.id].map(pr => (
                                            <li key={pr.n}>Projet : {pr.n} - {pr.w}</li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </section>
    )
}
