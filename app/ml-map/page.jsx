import PrereqMap from '../../src/components/PrereqMap/PrereqMap'

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
        </>
    )
}
